---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: splash

intro:
- image_path: favicon.png 
  title: "ROB / KUANYEN HUANG"
  excerpt: >
    An average game programmer / designer / enjoyer.
    <br>
    <br>
    Carnegie Mellon University graduate student with 7 years of game development experience, specializing in <span style="color: gold;">**gameplay
    programming**</span>, <span style="color: gold;">**tool creation**</span>, and <span style="color: gold;">**system design**</span>. Experienced across diverse projects in roles including <span style="color: gold;">**programmer**</span>,
    <span style="color: gold;">**designer**</span>, and <span style="color: gold;">**producer**</span>, with a proven ability to deliver impactful results both as a collaborative team member and as an
    independent developer.
    <br>
    <br>
    [Resume](/assets/Huang_KuanYen_Resume.pdf){: .btn .btn--light-outline .btn--large}  [Contact](mailto:benbook90@gmail.com){: .btn .btn--light-outline .btn--large}

features:
- image_path: /favicon.ico # Special feature image
  title: "Duplicate Solution Unacceptable" # Featured project name
  excerpt: >
    Brief intro content
    <br>
    <br>
    [Wish List](/link to steam page){: .btn .btn--light-outline .btn--large}
    [Check Out](/link to project introduction page){: .btn .btn--light-outline .btn--large}
    [Devlog](/link to latest devlog page){: .btn .btn--light-outline .btn--large}
projects: 
- image_path: /assets/images/projects/CreSpiritTalker/teaser.png
  title: "CreSpiritTalker"
  excerpt: >
    #Plugin #VisualNovel #Unity
  url: "/project/2025-6-CreSpiritTalker/"
  btn_label: "More"
  btn_class: "btn--light-outline"
- image_path: /assets/images/projects/Survivor For The Feast/teaser.jpg
  title: "Survivor For The Feast"
  excerpt: >
    #Action #SurvivorLike #Cooking #Unity
  url: "/project/2023-1-Survivor For The Feast/"
  btn_label: "More"
  btn_class: "btn--light-outline"
- image_path: /assets/images/projects/You Ken-Do It/teaser.jpg
  title: "You Ken-Do It"
  excerpt: >
    #VR #Action #Sport #Unity
  url: "/project/2023-7-You Ken-Do It/"
  btn_label: "More"
  btn_class: "btn--light-outline"

devlogs:
- image_path: devlog.png
  title: "DEVLOGS"
  excerpt: >
    Posting the devlogs of my developing stuffs. 
    <br>
    Sharing progress, ideas, and lessons learned along the way.
    <br>
    <br>
    <br>
    Latest devlog: [Vocabutory #2](/devlog/2025-07-25-Vocabutory-Devlog2/)
  url: "/devlogs.html"
  btn_label: "More"
  btn_class: "btn--light-outline"


articles:
- image_path: article.png
  title: "ARTICLES"
  excerpt: >
    Every game I play is a unique experience.
    <br>
    I will review some of the most memorable ones here.
    <br>
    <br>
    <br>
    Latest article: [Outer Wilds - My Heart Of Curiosity](/article/2025-06-23-OuterWilds-GameLog%232/)
  url: "/articles.html"
  btn_label: "More"
  btn_class: "btn--light-outline"

---

{% include feature_row id="intro" type="center" %}
.
{: .text-center}

<h1>PROJECTS</h1>
{: .text-center}
<!-- {% include feature_row id="features" type="feature" %} -->
{% include feature_row id="projects" type="project" %}
[More](/projects.html){: .btn .btn--light-outline .btn--large}
{: .text-center}
.
{: .text-center}

{% include feature_row id="devlogs" type="left" %}
.
{: .text-center}

{% include feature_row id="articles" type="right" %}