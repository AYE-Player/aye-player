import {
  app,
  Menu,
  shell,
  BrowserWindow,
  MenuItemConstructorOptions
} from "electron";

export default class MenuBuilder {
  mainWindow: BrowserWindow;
  i18n: any;

  constructor(mainWindow: BrowserWindow, i18n: any) {
    this.mainWindow = mainWindow;
    this.i18n = i18n;
  }

  buildMenu() {
    if (
      process.env.NODE_ENV === "development" ||
      process.env.DEBUG_PROD === "true"
    ) {
      this.setupDevelopmentEnvironment();
    }

    const template =
      process.platform === "darwin"
        ? this.buildDarwinTemplate()
        : this.buildDefaultTemplate();

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment() {
    this.mainWindow.webContents.toggleDevTools();
    this.mainWindow.webContents.on("context-menu", (e, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: "Inspect element",
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y);
          }
        }
      ]).popup({ window: this.mainWindow });
    });
  }

  buildDarwinTemplate(): MenuItemConstructorOptions[] {
    const subMenuAbout = {
      label: "Electron",
      submenu: [
        {
          label: this.i18n.t("About AYE-Player"),
          selector: "orderFrontStandardAboutPanel:"
        },
        { type: "separator" },
        { label: "Services", submenu: [] },
        { type: "separator" },
        {
          label: this.i18n.t("Hide AYE-Player"),
          accelerator: "Command+H",
          selector: "hide:"
        },
        {
          label: this.i18n.t("Hide Others"),
          accelerator: "Command+Shift+H",
          selector: "hideOtherApplications:"
        },
        { label: this.i18n.t("Show All"), selector: "unhideAllApplications:" },
        { type: "separator" },
        {
          label: "Quit",
          accelerator: "Command+Q",
          click: () => {
            app.quit();
          }
        }
      ]
    };
    const subMenuEdit = {
      label: "Edit",
      submenu: [
        { label: this.i18n.t("Undo"), accelerator: "Command+Z", selector: "undo:" },
        { label: this.i18n.t("Redo"), accelerator: "Shift+Command+Z", selector: "redo:" },
        { type: "separator" },
        { label: this.i18n.t("Cut"), accelerator: "Command+X", selector: "cut:" },
        { label: this.i18n.t("Copy"), accelerator: "Command+C", selector: "copy:" },
        { label: this.i18n.t("Paste"), accelerator: "Command+V", selector: "paste:" },
        {
          label: this.i18n.t("Select All"),
          accelerator: "Command+A",
          selector: "selectAll:"
        }
      ]
    };
    const subMenuViewDev = {
      label: this.i18n.t("View"),
      submenu: [
        {
          label: this.i18n.t("Reload"),
          accelerator: "Command+R",
          click: () => {
            this.mainWindow.webContents.reload();
          }
        },
        {
          label: this.i18n.t("Toggle Full Screen"),
          accelerator: "Ctrl+Command+F",
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          }
        },
        {
          label: this.i18n.t("Toggle Developer Tools"),
          accelerator: "Alt+Command+I",
          click: () => {
            this.mainWindow.webContents.toggleDevTools();
          }
        }
      ]
    };
    const subMenuViewProd = {
      label: this.i18n.t("View"),
      submenu: [
        {
          label: this.i18n.t("Toggle Full Screen"),
          accelerator: "Ctrl+Command+F",
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          }
        }
      ]
    };
    const subMenuWindow = {
      label: this.i18n.t("Window"),
      submenu: [
        {
          label: this.i18n.t("Minimize"),
          accelerator: "Command+M",
          selector: "performMiniaturize:"
        },
        { label: this.i18n.t("Close"), accelerator: "Command+W", selector: "performClose:" },
        { type: "separator" },
        { label: this.i18n.t("Bring All to Front"), selector: "arrangeInFront:" }
      ]
    };
    const subMenuHelp = {
      label: this.i18n.t("Help"),
      submenu: [
        {
          label: this.i18n.t("Learn More"),
          click() {
            shell.openExternal("http://electron.atom.io");
          }
        },
        {
          label: this.i18n.t("Documentation"),
          click() {
            shell.openExternal(
              "https://github.com/atom/electron/tree/master/docs#readme"
            );
          }
        },
        {
          label: this.i18n.t("Community Discussions"),
          click() {
            shell.openExternal("https://discuss.atom.io/c/electron");
          }
        },
        {
          label: this.i18n.t("Search Issues"),
          click() {
            shell.openExternal("https://github.com/atom/electron/issues");
          }
        }
      ]
    };

    const subMenuView =
      process.env.NODE_ENV === "development" ? subMenuViewDev : subMenuViewProd;

    return [
      subMenuAbout,
      subMenuEdit,
      subMenuView,
      subMenuWindow,
      subMenuHelp
    ] as MenuItemConstructorOptions[];
  }

  buildDefaultTemplate(): MenuItemConstructorOptions[] {
    const templateDefault = [
      {
        label: this.i18n.t("&View"),
        submenu:
          process.env.NODE_ENV === "development"
            ? [
                {
                  label: this.i18n.t("&Reload"),
                  accelerator: "Ctrl+R",
                  click: () => {
                    this.mainWindow.webContents.reload();
                  }
                },
                {
                  label: this.i18n.t("Toggle &Developer Tools"),
                  accelerator: "Alt+Ctrl+I",
                  click: () => {
                    this.mainWindow.webContents.toggleDevTools();
                  }
                }
              ]
            : []
      },
      {
        label: this.i18n.t("Help"),
        submenu: [
          {
            label: this.i18n.t("Learn More"),
            click() {
              shell.openExternal("http://electron.atom.io");
            }
          },
          {
            label: this.i18n.t("Documentation"),
            click() {
              shell.openExternal(
                "https://github.com/atom/electron/tree/master/docs#readme"
              );
            }
          },
          {
            label: this.i18n.t("Community Discussions"),
            click() {
              shell.openExternal("https://discuss.atom.io/c/electron");
            }
          },
          {
            label: this.i18n.t("Search Issues"),
            click() {
              shell.openExternal("https://github.com/atom/electron/issues");
            }
          }
        ]
      }
    ];

    return templateDefault;
  }
}
