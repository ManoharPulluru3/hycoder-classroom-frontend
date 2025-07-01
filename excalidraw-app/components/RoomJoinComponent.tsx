import React, { useState, useCallback, useEffect } from "react";
import { t } from "@excalidraw/excalidraw/i18n";
import { getCollaborationLinkData, isCollaborationLink } from "../data";
import type { CollabAPI } from "../collab/Collab";

interface RoomJoinComponentProps {
  collabAPI: CollabAPI | null;
  excalidrawAPI: any;
  isCollaborating: boolean;
  isMobile?: boolean;
  onError: (message: string) => void;
}

export const RoomJoinComponent: React.FC<RoomJoinComponentProps> = ({
  collabAPI,
  excalidrawAPI,
  isCollaborating,
  isMobile,
  onError,
}) => {
  const [joinUrl, setJoinUrl] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Effect to restore original beforeunload behavior after exit
  useEffect(() => {
    const originalBeforeUnload = window.onbeforeunload;
    return () => {
      window.onbeforeunload = originalBeforeUnload;
    };
  }, []);

  const handleJoinRoom = useCallback(async () => {
    if (!joinUrl.trim() || !collabAPI || !excalidrawAPI) {
      return;
    }

    try {
      setIsJoining(true);

      // Validate the URL
      if (!isCollaborationLink(joinUrl)) {
        onError("Error: Invalid collaboration link");
        return;
      }

      const roomLinkData = getCollaborationLinkData(joinUrl);
      if (!roomLinkData) {
        onError("Error");
        return;
      }

      // Stop current collaboration if any
      if (collabAPI.isCollaborating()) {
        console.log("Stopping existing collaboration before joining new room");
        collabAPI.stopCollaboration(true, true); // Pass true for keepRemoteState and skipConfirm
      }

      // Start new collaboration
      console.log("Starting new collaboration with room link:", roomLinkData);
      const scene = await collabAPI.startCollaboration(roomLinkData);

      if (scene) {
        excalidrawAPI.updateScene({
          ...scene,
          appState: {
            ...scene.appState,
            isLoading: false,
          },
        });
      }

      // Update URL without refreshing
      window.history.pushState({}, "", joinUrl);

      setJoinUrl("");
    } catch (error: any) {
      onError(error.message || "Error joining room");
    } finally {
      setIsJoining(false);
    }
  }, [joinUrl, collabAPI, excalidrawAPI, onError]);

  const handleExitRoom = useCallback(() => {
    setShowExitModal(true);
  }, []);

  const confirmExitRoom = useCallback(() => {
    if (collabAPI && collabAPI.isCollaborating()) {
      console.log("Confirming exit room, calling stopCollaboration");
      // Temporarily disable beforeunload to prevent Excalidraw's alert
      const originalBeforeUnload = window.onbeforeunload;
      window.onbeforeunload = null;

      collabAPI.stopCollaboration(true, true); // Pass true for keepRemoteState and skipConfirm

      // Reset URL to home
      window.history.pushState({}, "", window.location.origin);

      // Clear any collaboration state
      excalidrawAPI?.updateScene({
        appState: {
          isLoading: false,
        },
      });

      console.log("Collaboration stopped, isCollaborating:", collabAPI.isCollaborating());
      // Restore original beforeunload behavior
      window.onbeforeunload = originalBeforeUnload;
    }
    setShowExitModal(false);
  }, [collabAPI, excalidrawAPI]);

  const cancelExitRoom = useCallback(() => {
    setShowExitModal(false);
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleJoinRoom();
    }
  };

  // Use consistent placeholder text for both mobile and desktop
  const placeholderText = "Paste collaboration link...";

  return (
    <>
      {isMobile ? (
        <div className="room-join-mobile">
          {!isCollaborating ? (
            <div className="join-room-controls">
              <input
                type="text"
                value={joinUrl}
                onChange={(e) => setJoinUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholderText}
                className="join-room-input"
                disabled={isJoining}
              />
              <button
                onClick={handleJoinRoom}
                disabled={!joinUrl.trim() || isJoining}
                className="join-room-button"
                title="Join Room"
              >
                {isJoining ? "..." : "Join"}
              </button>
            </div>
          ) : (
            <button
              onClick={handleExitRoom}
              className="exit-room-button"
              title="Exit Room"
            >
              Close Room
            </button>
          )}
        </div>
      ) : (
        <div className="room-join-desktop">
          {!isCollaborating ? (
            <div className="join-room-controls">
              <input
                type="text"
                value={joinUrl}
                onChange={(e) => setJoinUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholderText}
                className="join-room-input"
                disabled={isJoining}
              />
              <button
                onClick={handleJoinRoom}
                className="join-room-button"
                title="Join Room"
              >
                {isJoining ? "Joining..." : "Join"}
              </button>
            </div>
          ) : (
            <button
              onClick={handleExitRoom}
              className="exit-room-button"
              title="Exit Room"
            >
              Exit Room
            </button>
          )}
        </div>
      )}

      {showExitModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 className="modal-title">Are you sure?</h3>
            <p className="modal-note">
              Exiting the room will disconnect you from the collaboration session.
              Save your work locally if you want a backup.
            </p>
            <div className="modal-buttons">
              <button
                onClick={confirmExitRoom}
                className="modal-button modal-button-confirm"
              >
                Yes
              </button>
              <button
                onClick={cancelExitRoom}
                className="modal-button modal-button-cancel"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};