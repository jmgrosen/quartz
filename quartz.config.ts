import { QuartzConfig, PageLayout } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"
import * as Component from "./quartz/components"

const indexPageLayout: PageLayout = {
  beforeBody: [
    Component.MobileOnly(Component.Explorer({ title: null })),
    Component.Breadcrumbs(),
  ],
  left: [
    Component.PageTitle(),
    // Component.MobileOnly(Component.Spacer()),
    // Component.Search(),
    // Component.Darkmode(),
    Component.DesktopOnly(Component.Explorer({ title: null })),
  ],
  right: [
    Component.RecentNotes({ title: "recent posts", filter: (d) => d.slug.startsWith("posts/") }),
  ],
}

const config: QuartzConfig = {
  configuration: {
    pageTitle: "it's jessie",
    enableSPA: false,
    enablePopovers: true,
    analytics: null,
    locale: "en-US",
    baseUrl: "jessie.grosen.systems",
    ignorePatterns: ["!(public-media)**/!(*.md)", "!(*.md)", "templates", ".obsidian"],
    defaultDateType: "created",
    theme: {
      cdnCaching: true,
      typography: {
        header: "Schibsted Grotesk",
        body: "Source Sans Pro",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: "#faf8f8",
          lightgray: "#e5e5e5",
          gray: "#b8b8b8",
          darkgray: "#4e4e4e",
          dark: "#2b2b2b",
          secondary: "#284b63",
          tertiary: "#84a59d",
          highlight: "rgba(143, 159, 169, 0.15)",
        },
        darkMode: {
          light: "#161618",
          lightgray: "#393639",
          gray: "#646464",
          darkgray: "#d4d4d4",
          dark: "#ebebec",
          secondary: "#7b97aa",
          tertiary: "#84a59d",
          highlight: "rgba(143, 159, 169, 0.15)",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        // you can add 'git' here for last modified from Git
        // if you do rely on git for dates, ensure defaultDateType is 'modified'
        priority: ["frontmatter", "filesystem"],
      }),
      Plugin.Latex({ renderEngine: "katex" }),
      Plugin.SyntaxHighlighting(),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
    ],
    filters: [Plugin.ExplicitPublish()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources({ fontOrigin: "googleFonts" }),
      Plugin.ContentPage({ filter: d => d.slug !== 'index' }),
      Plugin.ContentPage({ filter: d => d.slug === 'index', layout: indexPageLayout }),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
        rssFullHtml: true,
        rssFilter: (slug, _) => slug.startsWith("posts/"),
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.NotFoundPage(),
    ],
  },
}

export default config
