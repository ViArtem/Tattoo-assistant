import React, { useState, useEffect } from "react";
import FilerobotImageEditor, {
  TABS,
  TOOLS,
} from "react-filerobot-image-editor";
import "../App.css";
import { useLocation } from "react-router-dom";

import defaultImage from "../images/default.jpg";

import { saveAs } from "file-saver";

function Editor() {
  const [filePath, setFilePath] = useState(defaultImage);
  const [hasImg, setHasImg] = useState(true);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const imageId = searchParams.get("imageId");

  // checking the availability of photos on the server
  useEffect(async () => {
    try {
      const checkImage = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/get/image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imageId }),
        }
      );

      const reader = checkImage.body.getReader();
      let result = "";
      let done = false;

      while (!done) {
        const { value, done: streamDone } = await reader.read();

        if (streamDone) {
          done = true;
        } else {
          const chunk = new TextDecoder("utf-8").decode(value);
          result += chunk;
        }
      }

      const res = JSON.parse(result);

      if (res.status != "The file does not exist") {
        setHasImg(false);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  // receiving photos from the server
  useEffect(() => {
    if (imageId && hasImg) {
      setTimeout(() => {
        setFilePath(
          `${process.env.REACT_APP_SERVER_URL}/images/${imageId}.png`
        );
      }, 500);
    }
  }, []);

  // tracking the closing of the window
  useEffect(() => {
    const handleTabClose = (event) => {
      event.preventDefault();

      if (imageId && !hasImg) {
        closeImgEditor();
      }

      return (event.returnValue = "Are you sure you want to exit?");
    };

    window.addEventListener("beforeunload", handleTabClose);

    return () => {
      window.removeEventListener("beforeunload", handleTabClose);
    };
  }, [filePath]);

  // Request to delete a photo from the server
  async function closeImgEditor() {
    setFilePath(Math.random());
    try {
      await fetch(`${process.env.REACT_APP_SERVER_URL}/delete/image`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageId }),
      });
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div>
      {!imageId ? (
        <div
          style={{ marginLeft: "auto", marginRight: "auto", width: "300px" }}
        >
          <input
            id="imageInput"
            className="fileInput"
            type="file"
            onChange={(e) => {
              setFilePath(URL.createObjectURL(e.target.files[0]));
            }}
          />
          <span className="fileInputSpan">
            <label for="imageInput">OPEN NEW FILE</label>
          </span>
        </div>
      ) : (
        <div></div>
      )}

      {
        <FilerobotImageEditor
          source={filePath ? filePath : defaultImage}
          onSave={async (editedImageObject, designState) => {
            const base64Image = editedImageObject.imageBase64.replace(
              /^data:image\/(png|jpeg|jpg|webp);base64,/,
              ""
            );

            // photo saving
            const byteArray = new Uint8Array(
              atob(base64Image)
                .split("")
                .map((char) => char.charCodeAt(0))
            );

            const fileData = new Blob([byteArray], {
              type: `image/${editedImageObject.extension}`,
            });

            saveAs(fileData, `${editedImageObject.fullName}`);
          }}
          onClose={closeImgEditor}
          annotationsCommon={{
            fill: "#ff0000",
          }}
          Text={{ text: "Filerobot..." }}
          Rotate={{ angle: 90, componentType: "slider" }}
          Crop={{
            presetsItems: [
              {
                titleKey: "classicTv",
                descriptionKey: "4:3",
                ratio: 4 / 3,
              },
              {
                titleKey: "cinemascope",
                descriptionKey: "21:9",
                ratio: 21 / 9,
              },
            ],
            presetsFolders: [
              {
                titleKey: "socialMedia",

                groups: [
                  {
                    titleKey: "facebook",
                    items: [
                      {
                        titleKey: "profile",
                        width: 180,
                        height: 180,
                        descriptionKey: "fbProfileSize",
                      },
                      {
                        titleKey: "coverPhoto",
                        width: 820,
                        height: 312,
                        descriptionKey: "fbCoverPhotoSize",
                      },
                    ],
                  },
                ],
              },
            ],
          }}
          tabsIds={[TABS.ADJUST, TABS.ANNOTATE, TABS.WATERMARK]}
          defaultTabId={TABS.ANNOTATE}
          defaultToolId={TOOLS.TEXT}
        />
      }
      {hasImg && imageId ? (
        <h1 style={{ textAlign: "center" }}>
          The link is not valid, generate a new one
        </h1>
      ) : (
        ""
      )}
    </div>
  );
}

export default Editor;
