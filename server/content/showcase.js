export function resolveHomeProjects(pages, projects) {
  const groups = pages.home?.data.project_groups || {};
  if (typeof groups !== 'object' || Array.isArray(groups)) throw new Error('home.md: project_groups must map tag names to project lists');
  const resolveProjects = (references, field) => {
    if (!Array.isArray(references) || references.some(ref => typeof ref !== 'string' || !ref.trim()) || new Set(references).size !== references.length) {
      throw new Error(`home.md: ${field} must contain unique project filenames without .md`);
    }
    return references.map(reference => {
      const project = projects.get(reference);
      if (!project || project.data.hidden === true) throw new Error(`home.md: ${field} references unavailable project ${reference}`);
      return project;
    });
  };
  return Object.entries(groups).map(([tag, references]) => {
    if (!tag.trim()) throw new Error('home.md: project_groups tag names must not be empty');
    return { tag, projects: resolveProjects(references, `project_groups ${tag}`) };
  });
}
