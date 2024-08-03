import busboy from "busboy";
import { type NextApiRequest, type NextApiResponse } from "next";

// const svgMock = `<svg xmlns="http://www.w3.org/2000/svg" width="2190" height="1230" baseProfile="tiny" version="1.2"><path fill="none" stroke="#000" d="M834.72 329.895v853.07h369.955v-853.07Z"><desc>person</desc></path><path fill="none" stroke="#000" d="M1264.586 319.862v786.953h274.817V319.862Z"><desc>person</desc></path><path fill="none" stroke="#000" d="M1921.584 376.554v757.208h219.306V376.554Z"><desc>person</desc></path><path fill="none" stroke="#000" d="M329.585 396.905v741.178h221.92V396.905Z"><desc>person</desc></path><path fill="none" stroke="#000" d="M2053.17 308.118v774.61h135.947v-774.61Z"><desc>person</desc></path><path fill="none" stroke="#000" d="M524.992 387.502v736.9h203.442v-736.9Z"><desc>person</desc></path><path fill="none" stroke="#000" d="M739.934 704.306v487.721h224.764v-487.72Z"><desc>bicycle</desc></path><path fill="none" stroke="#000" d="M1279.015 669.06v520.756h214.948V669.059Z"><desc>bicycle</desc></path><path fill="none" stroke="#000" d="M1608.615 369.03v771.776h307.033V369.03Z"><desc>person</desc></path><path fill="none" stroke="#000" d="M488.54 518.456v261.898h147.127V518.456Z"><desc>handbag</desc></path><path fill="none" stroke="#000" d="M1979.094 520.351v180.45h89.806V520.35Z"><desc>backpack</desc></path></svg>`;

const processUpload = async (req: NextApiRequest) => {
  return new Promise<string>((resolve, reject) => {
    // TODO: Add limits and error handling
    const bb = busboy({
      headers: req.headers,
      // limits: { files: maxFiles, fileSize: maxFileSize },
    });

    let body = Buffer.from("");
    let mimetype = "";

    bb.on("file", (name, file, info) => {
      const { filename, mimeType } = info;
      mimetype = mimeType;

      file.on("data", (data) => {
        console.log("Data", data);
        // await new Promise((resolve) => {
        //   setTimeout(resolve, 2000);
        // });

        body = Buffer.concat([body, data]);
      });

      // file.pipe(new Throttle({ rate: 100 })).pipe(process.stdout);
    });

    bb.on("close", () => {
      const formData = new FormData();
      formData.append(
        "file",
        new Blob([body], { type: mimetype }),
        mimetype === "image/jpeg" ? "image.jpg" : "image.png",
      );

      console.log(formData);
      console.log(body);
      console.log(new Blob([body], { type: mimetype }));

      fetch(
        "http://ec2-15-160-111-224.eu-south-1.compute.amazonaws.com:8080/upload-image/",
        {
          method: "POST",
          body: formData,
        },
      )
        .then((response) => response.text())
        .then((text) => {
          resolve(text);
        })
        .catch((error) => {
          reject(error);
        });
    });

    req.pipe(bb);
  });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    // await new Promise((resolve) => {
    //   setTimeout(resolve, 2000);
    // });

    // res.status(200).setHeader("Content-Type", "image/svg+xml").send(svgMock);

    try {
      const data = await processUpload(req);

      // const response = await fetch(
      //   "http://ec2-15-160-111-224.eu-south-1.compute.amazonaws.com/upload-image/",
      //   {
      //     method: "POST",
      //     body: req.body,
      //   },
      // );

      res.status(200).send(data);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error");
    }

    return;
  } else {
    // Handle any other HTTP method
    res.status(405).end();
    return;
  }
}
export const config = {
  api: {
    bodyParser: false,
  },
};
