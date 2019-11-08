import {
  app,
  Menu,
  shell,
  BrowserWindow,
  MenuItemConstructorOptions
} from "electron";
import { i18n } from "i18next";

export default class MenuBuilder {
  mainWindow: BrowserWindow;
  i18n: i18n;

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
          label: this.i18n.t("macMenu.AboutAYEPlayer"),
          selector: "orderFrontStandardAboutPanel:"
        },
        { type: "separator" },
        { label: "Services", submenu: [] },
        { type: "separator" },
        {
          label: this.i18n.t("macMenu.HideAYEPlayer"),
          accelerator: "Command+H",
          selector: "hide:"
        },
        {
          label: this.i18n.t("macMenu.HideOthers"),
          accelerator: "Command+Shift+H",
          selector: "hideOtherApplications:"
        },
        {
          label: this.i18n.t("macMenu.ShowAll"),
          selector: "unhideAllApplications:"
        },
        { type: "separator" },
        {
          label: this.i18n.t("macMenu.Quit"),
          accelerator: "Command+Q",
          click: () => {
            app.quit();
          }
        }
      ]
    };
    const subMenuEdit = {
      label: this.i18n.t("macMenu.Edit"),
      submenu: [
        {
          label: this.i18n.t("macMenu.Undo"),
          accelerator: "Command+Z",
          selector: "undo:"
        },
        {
          label: this.i18n.t("macMenu.Redo"),
          accelerator: "Shift+Command+Z",
          selector: "redo:"
        },
        { type: "separator" },
        {
          label: this.i18n.t("macMenu.Cut"),
          accelerator: "Command+X",
          selector: "cut:"
        },
        {
          label: this.i18n.t("macMenu.Copy"),
          accelerator: "Command+C",
          selector: "copy:"
        },
        {
          label: this.i18n.t("macMenu.Paste"),
          accelerator: "Command+V",
          selector: "paste:"
        },
        {
          label: this.i18n.t("macMenu.SelectAll"),
          accelerator: "Command+A",
          selector: "selectAll:"
        }
      ]
    };
    const subMenuViewDev = {
      label: this.i18n.t("macMenu.View"),
      submenu: [
        {
          label: this.i18n.t("macMenu.Reload"),
          accelerator: "Command+R",
          click: () => {
            this.mainWindow.webContents.reload();
          }
        },
        {
          label: this.i18n.t("macMenu.ToggleFullScreen"),
          accelerator: "Ctrl+Command+F",
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          }
        },
        {
          label: this.i18n.t("macMenu.ToggleDeveloperTools"),
          accelerator: "Alt+Command+I",
          click: () => {
            this.mainWindow.webContents.toggleDevTools();
          }
        }
      ]
    };
    const subMenuViewProd = {
      label: this.i18n.t("macMenu.View"),
      submenu: [
        {
          label: this.i18n.t("macMenu.ToggleFullScreen"),
          accelerator: "Ctrl+Command+F",
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          }
        }
      ]
    };
    const subMenuWindow = {
      label: this.i18n.t("macMenu.Window"),
      submenu: [
        {
          label: this.i18n.t("macMenu.Minimize"),
          accelerator: "Command+M",
          selector: "performMiniaturize:"
        },
        {
          label: this.i18n.t("macMenu.Close"),
          accelerator: "Command+W",
          selector: "performClose:"
        },
        { type: "separator" },
        {
          label: this.i18n.t("macMenu.BringAllToFront"),
          selector: "arrangeInFront:"
        }
      ]
    };
    const subMenuHelp = {
      label: this.i18n.t("macMenu.Help"),
      submenu: [
        {
          label: this.i18n.t("macMenu.LearnMore"),
          click() {
            shell.openExternal("http://electron.atom.io");
          }
        },
        {
          label: this.i18n.t("macMenu.Documentation"),
          click() {
            shell.openExternal(
              "https://github.com/atom/electron/tree/master/docs#readme"
            );
          }
        },
        {
          label: this.i18n.t("macMenu.CommunityDiscussions"),
          click() {
            shell.openExternal("https://discuss.atom.io/c/electron");
          }
        },
        {
          label: this.i18n.t("macMenu.SearchIssues"),
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
        label: this.i18n.t("menu.Help"),
        submenu: [
          {
            label: this.i18n.t("menu.LearnMore"),
            click() {
              shell.openExternal("http://electron.atom.io");
            }
          },
          {
            label: this.i18n.t("menu.Documentation"),
            click() {
              shell.openExternal(
                "https://github.com/atom/electron/tree/master/docs#readme"
              );
            }
          },
          {
            label: this.i18n.t("menu.CommunityDiscussions"),
            click() {
              shell.openExternal("https://discuss.atom.io/c/electron");
            }
          },
          {
            label: this.i18n.t("menu.SearchIssues"),
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
