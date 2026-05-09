export const normalizeSkillTags = (skillTags = []) => {
  if (!Array.isArray(skillTags)) {
    return [];
  }

  const normalized = skillTags
    .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
    .filter(Boolean);

  return [...new Set(normalized)];
};

export const pickBestAgentForTicket = async ({ agents, requiredSkills = [] }) => {
  if (!Array.isArray(agents) || agents.length === 0) {
    return null;
  }

  const normalizedRequiredSkills = normalizeSkillTags(requiredSkills);
  const agentsWithLoad = agents.map((agent) => ({
    agent,
    load: Number.isFinite(agent.ticketLoad) ? agent.ticketLoad : 0,
    skillMatchCount: normalizedRequiredSkills.length === 0
      ? 0
      : normalizeSkillTags(agent.skillTags || []).filter((skill) => normalizedRequiredSkills.includes(skill)).length,
  }));

  agentsWithLoad.sort((left, right) => {
    if (right.skillMatchCount !== left.skillMatchCount) {
      return right.skillMatchCount - left.skillMatchCount;
    }

    if (left.load !== right.load) {
      return left.load - right.load;
    }

    const leftName = left.agent.name || '';
    const rightName = right.agent.name || '';
    return leftName.localeCompare(rightName);
  });

  return agentsWithLoad[0]?.agent || null;
};