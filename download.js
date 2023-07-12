"use strict";

function createDownloadLink(filename, text) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const downloadLink = document.createElement("a");
  downloadLink.textContent = filename;
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = filename;
  return downloadLink;
}
