<script>
export default {
  name: 'Footer',

  data() {
    return {
      // dynamically bind current project repo web address
      githubRepo: 'https://github.com/bradleyhop/d3-choropleth',
    };
  },

  computed: {
    currentYear() {
      return new Date().getFullYear();
    },
  },
};
</script>

<template>
  <div class="footer-content">
    <div class="footer-copy">
      <p><sup>*</sup>Source:
      <a
        class="footer-link"
        href="https://www.ers.usda.gov/data-products/county-level-data-sets/download-data.aspx"
        rel="noopener noreferer"
        target="_blank"
      >
      USDA Economic Research Service
      </a>
      </p>
      <a
        class="footer-link"
        href="https://github.com/bradleyhop/"
        rel="noopener noreferer"
        target="_blank"
      >
        Bradley Smith
      </a>
        &#169;{{ currentYear }}
        [&nbsp;
      <a
        class="footer-link"
        :href="githubRepo"
        rel="noopener noreferer"
        target="_blank"
      >
        Project GitHub
      </a>
        &nbsp;]
    </div>
  </div>
</template>

<style scoped lang="scss">
.footer-content {
  color: $text-default;
  // height: 2.5rem;
  margin: 0;
  padding: 0.5rem;
}

.footer-copy {
  float: right;
  line-height: 1.5rem;
  margin-bottom: 1rem;
  margin-right: 1rem;
}

.footer-link {
  color: $text-default;
  text-decoration: none;
}

.footer-link:hover {
  text-decoration: underline;
}

.footer-link:active {
  color: $text-default;
}
</style>
