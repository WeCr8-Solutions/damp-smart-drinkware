export default {
    launch: {
        headless: "new",
        defaultViewport: { width: 1280, height: 800 },
        args: ['--start-maximized', '--no-sandbox'],
        ignoreDefaultArgs: ['--disable-extensions']
    },
    browserContext: 'default'
};