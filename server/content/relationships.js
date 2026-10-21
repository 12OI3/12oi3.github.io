// Resolve references after all published collections have been loaded.
export function linkDevlogs(collections) {
  // Devlogs own the relationship; projects derive their lists on every load/build.
  const projects = new Map(collections.project.map(project => {
    project.linkedDevlogs = [];
    return [project.slug, project];
  }));
  for (const devlog of collections.devlog) {
    const reference = devlog.data.project;
    const hasLegacyProject = reference !== undefined && reference !== null && reference !== '';
    if (hasLegacyProject && (typeof reference !== 'string' || !projects.has(reference))) {
      throw new Error(`${devlog.slug}.md: project must match a published project filename without .md (received ${JSON.stringify(reference)})${Array.isArray(reference) ? '. For multiple projects, rename project: to projects:' : ''}`);
    }
    const references = devlog.data.projects === undefined ? [] : devlog.data.projects;
    if (!Array.isArray(references) || references.some(ref => typeof ref !== 'string' || !ref.trim())) {
      throw new Error(`${devlog.slug}.md: projects must be a YAML list of project filenames without .md`);
    }
    devlog.linkedProjects = [];
    for (const ref of new Set([...(hasLegacyProject ? [reference] : []), ...references])) {
      const project = projects.get(ref);
      if (!project) throw new Error(`${devlog.slug}.md: projects must match published project filenames without .md (received ${JSON.stringify(ref)})`);
      devlog.linkedProjects.push({ title: project.data.title, url: project.url });
      if (devlog.data.hidden !== true) project.linkedDevlogs.push(devlog);
    }
  }
  return projects;
}

export function highlightedDevlog(project) {
  return project.linkedDevlogs?.find(devlog => devlog.data.highlight === true);
}
