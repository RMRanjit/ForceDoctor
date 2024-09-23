export const topics: Topic[] = [
  {
    Title: "Why do you need a healthcheck?",
    Description:
      "A health check can uncover configuration problems that could be causing system instability, performance lagging, or features not working as expected. Finding these early prevents bigger problems down the road.",
    hyperLink: "/home",
    hyperLinkText: "See Summary",
  },
  {
    Title: "Is your platform running at the best performance?",
    Description:
      "Checking performance metrics can reveal slow page load times, inefficient automation processes, and other bottlenecks. Addressing these allows for a faster, more responsive Salesforceenvironment.",
    hyperLink: "/events",
    hyperLinkText: "View Details",
  },
  {
    Title: "Are you within the usage limits?",
    Description:
      " Reviews usage limits, redundant 3rd party apps, and find optimization opportunities like storage allocation adjustments. Tightening these areas reduces operating costs.",
    hyperLink: "/limits",
    hyperLinkText: "Show Limits",
  },
  {
    Title: "Did you check your code for problems?",
    Description:
      "Finds common programming flaws like unused variables, empty catch blocks, unnecessary object creation, and so forth",
    hyperLink: "/usage",
    hyperLinkText: "View Details",
  },
  {
    Title: "Do your custom objects have documentation?",
    Description:
      "Generate markup pages that fully document each class, including its properties, interfaces, annotation, and methods. ",
    hyperLink: "/usage",
    hyperLinkText: "View Details",
  },
  {
    Title: "Do you know object dependencies and Usage",
    Description:
      "An extended 'Where is it used?' for your platform. Determine the dependencies and usage of objects..",
    hyperLink: "/usage",
    hyperLinkText: "View Details",
  },
];

export interface Topic {
  Title: string;
  Description: string;
  Footer?: string;
  hyperLink: string;
  hyperLinkText: string;
}
