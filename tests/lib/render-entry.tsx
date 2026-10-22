// Point d'entrée des tests de rendu : les graphiques et react-dom/server dans un même paquet.
import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"

import { Arc, HeatMatrix, LineChart, ProgressBar } from "../../src/ui/charts"

export const html = (node: React.ReactElement) => renderToStaticMarkup(node)
export { Arc, HeatMatrix, LineChart, ProgressBar, React }
