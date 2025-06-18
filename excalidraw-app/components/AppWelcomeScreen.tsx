import React from "react";
import { WelcomeScreen } from "@excalidraw/excalidraw/index";
import { useI18n } from "@excalidraw/excalidraw/i18n";
import { POINTER_EVENTS } from "@excalidraw/common";

import { isExcalidrawPlusSignedUser } from "../app_constants";
import hycoderLogo from "../assets/logo1.png";

export const AppWelcomeScreen: React.FC<{
  onCollabDialogOpen: () => any;
  isCollabEnabled: boolean;
}> = React.memo((props) => {
  const { t } = useI18n();
  let headingContent;

  if (isExcalidrawPlusSignedUser) {
    headingContent = t("welcomeScreen.app.center_heading_plus")
      .split(/(Excalidraw\+)/)
      .map((bit, idx) => {
        if (bit === "Excalidraw+") {
          return (
            <a
              style={{ pointerEvents: POINTER_EVENTS.inheritFromUI }}
              href={`${
                import.meta.env.VITE_APP_PLUS_APP
              }?utm_source=excalidraw&utm_medium=app&utm_content=welcomeScreenSignedInUser`}
              key={idx}
            >
              Excalidraw+
            </a>
          );
        }
        return bit;
      });
  } else {
    headingContent = t("welcomeScreen.app.center_heading");
  }

  return (
    <WelcomeScreen>
      <WelcomeScreen.Hints.MenuHint>
        {t("welcomeScreen.app.menuHint")}
      </WelcomeScreen.Hints.MenuHint>
      <WelcomeScreen.Hints.ToolbarHint />
      <WelcomeScreen.Hints.HelpHint />
      <WelcomeScreen.Center>
        <div>
          <img
            src={hycoderLogo}
            alt="hycoder logo"
            style={{
              maxWidth: "100%", // Ensure logo doesn't overflow container
              maxHeight: "20vh", // Limit height to 20% of viewport height
              width: "auto", // Maintain aspect ratio
              height: "auto", // Maintain aspect ratio
            }}
          />
        </div>
        <WelcomeScreen.Center.Heading>
          {headingContent}
        </WelcomeScreen.Center.Heading>
        <WelcomeScreen.Center.Menu>
          <WelcomeScreen.Center.MenuItemLoadScene />
          <WelcomeScreen.Center.MenuItemHelp />
          {props.isCollabEnabled && (
            <WelcomeScreen.Center.MenuItemLiveCollaborationTrigger
              onSelect={() => props.onCollabDialogOpen()}
            />
          )}
        </WelcomeScreen.Center.Menu>
      </WelcomeScreen.Center>
    </WelcomeScreen>
  );
});
