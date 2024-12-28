/**
 * @typedef {Object} Settings
 * @property {import('../config/constants').TAB_ANIMATION_OPTIONS[keyof import('../config/constants').TAB_ANIMATION_OPTIONS]} tabAnimation - The animation type for tab transitions
 */

/**
 * Default settings object
 * @type {Settings}
 */
const defaultSettings = {
  tabAnimation: TAB_ANIMATION_OPTIONS.NONE
};

export { defaultSettings };
