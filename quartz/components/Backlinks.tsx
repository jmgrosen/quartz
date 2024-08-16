import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/backlinks.scss"
import { resolveRelative, simplifySlug } from "../util/path"
import { i18n } from "../i18n"
import { classNames } from "../util/lang"

interface BacklinksOptions {
  renderWhenNone: boolean
}

const defaultOptions: BacklinksOptions = {
  renderWhenNone: true,
}

export default ((opts?: BacklinksOptions) => {
  const options = { ...defaultOptions, ...opts }
  function Backlinks({ fileData, allFiles, displayClass, cfg }: QuartzComponentProps) {
    const slug = simplifySlug(fileData.slug!)
    const backlinkFiles = allFiles.filter((file) => file.links?.includes(slug))
    if (options.renderWhenNone || backlinkFiles.length > 0) {
      return (
        <div class={classNames(displayClass, "backlinks")}>
          <h3>{i18n(cfg.locale).components.backlinks.title}</h3>
          <ul class="overflow">
            {backlinkFiles.length > 0 ? (
              backlinkFiles.map((f) => (
                <li>
                  <a href={resolveRelative(fileData.slug!, f.slug!)} class="internal">
                    {f.frontmatter?.title}
                  </a>
                </li>
              ))
            ) : (
              <li>{i18n(cfg.locale).components.backlinks.noBacklinksFound}</li>
            )}
          </ul>
        </div>
      )
    } else {
      return ( <> </> )
    }
  }

  Backlinks.css = style

  return Backlinks
}) satisfies QuartzComponentConstructor
