export function downloadFile(url: string, fileName: string) {
  fetch(url, {
    method: "get",
    referrerPolicy: "no-referrer",
    credentials: "include",
  })
    .then((res) => res.blob())
    .then((blob) => {
      const aElement = document.createElement("a");
      aElement.setAttribute("download", fileName);
      const href = URL.createObjectURL(blob);
      aElement.href = href;
      aElement.setAttribute("target", "_blank");
      aElement.setAttribute("rel", "noopener noreferrer");
      aElement.click();
      URL.revokeObjectURL(href);
    });
}
