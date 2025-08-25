jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install deps
        run: npm install

      - name: Run M3U Merge
        env:
          GH_TOKEN: ${{ secrets.GH_TOKEN }}
        run: node m3u.js
