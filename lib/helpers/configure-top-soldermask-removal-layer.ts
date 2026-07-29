import { CutSetting, type LightBurnProject } from "lbrnts"

export const TOP_SOLDERMASK_REMOVAL_LAYER_INDEX = 16
export const TOP_SOLDERMASK_REMOVAL_LAYER_NAME = "Top Soldermask Removal"

export const configureTopSoldermaskRemovalLayer = (
  project: LightBurnProject,
): CutSetting | undefined => {
  const cutSetting = project.children.find(
    (child): child is CutSetting =>
      child instanceof CutSetting &&
      child.index === TOP_SOLDERMASK_REMOVAL_LAYER_INDEX,
  )

  if (cutSetting) {
    cutSetting.name = TOP_SOLDERMASK_REMOVAL_LAYER_NAME
  }

  return cutSetting
}
