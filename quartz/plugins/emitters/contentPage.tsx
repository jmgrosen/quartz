import { QuartzEmitterPlugin } from "../types"
import { QuartzComponentProps } from "../../components/types"
import HeaderConstructor from "../../components/Header"
import BodyConstructor from "../../components/Body"
import { pageResources, renderPage } from "../../components/renderPage"
import { FullPageLayout } from "../../cfg"
import { FilePath, joinSegments, pathToRoot } from "../../util/path"
import { defaultContentPageLayout, sharedPageComponents } from "../../../quartz.layout"
import { QuartzPluginData } from "../vfile"
import { Content } from "../../components"
import chalk from "chalk"
import { write } from "./helpers"
import DepGraph from "../../depgraph"

interface ContentPageOptions {
  layout: Partial<FullPageLayout>
  filter: (f: QuartzPluginData) => boolean
}

const defaultOptions: ContentPageOptions = {
  layout: {},
  filter: () => true,
}

export const ContentPage: QuartzEmitterPlugin<Partial<ContentPageOptions>> = (userOpts) => {
  const options: ContentPageOptions = { ...defaultOptions, ...userOpts };

  const layout: FullPageLayout = {
    ...sharedPageComponents,
    ...defaultContentPageLayout,
    pageBody: Content(),
    ...options.layout,
  }

  const { head: Head, header, beforeBody, pageBody, left, right, footer: Footer } = layout
  const Header = HeaderConstructor()
  const Body = BodyConstructor()

  return {
    name: "ContentPage",
    getQuartzComponents() {
      return [Head, Header, Body, ...header, ...beforeBody, pageBody, ...left, ...right, Footer]
    },
    async getDependencyGraph(ctx, content, _resources) {
      // TODO handle transclusions
      const graph = new DepGraph<FilePath>()

      for (const [_tree, file] of content) {
        const sourcePath = file.data.filePath!
        const slug = file.data.slug!
        graph.addEdge(sourcePath, joinSegments(ctx.argv.output, slug + ".html") as FilePath)
      }

      return graph
    },
    async emit(ctx, content, resources): Promise<FilePath[]> {
      const cfg = ctx.cfg.configuration
      const fps: FilePath[] = []
      const allFiles = content.map((c) => c[1].data)

      let containsIndex = false
      for (const [tree, file] of content) {
        const slug = file.data.slug!
        if (slug === "index") {
          containsIndex = true
        }
	// do the index check first in case something else handles the index page
	if (!options.filter(file.data)) {
	  continue;
	}

        const externalResources = pageResources(pathToRoot(slug), resources)
        const componentData: QuartzComponentProps = {
          fileData: file.data,
          externalResources,
          cfg,
          children: [],
          tree,
          allFiles,
        }

        const content = renderPage(cfg, slug, componentData, layout, externalResources)
        const fp = await write({
          ctx,
          content,
          slug,
          ext: ".html",
        })

        fps.push(fp)
      }

      if (!containsIndex && !ctx.argv.fastRebuild) {
        console.log(
          chalk.yellow(
            `\nWarning: you seem to be missing an \`index.md\` home page file at the root of your \`${ctx.argv.directory}\` folder. This may cause errors when deploying.`,
          ),
        )
      }

      return fps
    },
  }
}
