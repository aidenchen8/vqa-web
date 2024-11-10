export default {
  extends: [
    "stylelint-config-standard",
    "stylelint-config-clean-order",
    "stylelint-config-html/html",
    "stylelint-config-html/vue",
  ],
  rules: {
    "at-rule-no-unknown": null,
    "font-family-no-missing-generic-family-keyword": null,
    "selector-pseudo-class-no-unknown": [
      true,
      {
        ignorePseudoClasses: ["deep"],
      },
    ],
    "selector-class-pattern": null,
    "alpha-value-notation": null,
    "color-function-notation": null,
    "unit-no-unknown": [
      true,
      {
        ignoreUnits: ["rpx", "dpx"],
      },
    ],
    "import-notation": null,
  },
};
