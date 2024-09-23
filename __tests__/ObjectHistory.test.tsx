import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { ObjectHistory } from "./ObjectHistory";

jest.mock("@/lib/Salesforce", () => ({
  getMetaDataById: jest.fn(),
  getTopic: jest.fn(),
}));

jest.mock("@/lib/utils", () => ({
  convertToDatetimeAndFormat: jest.fn(),
}));

jest.mock("xlsx", () => ({
  utils: {
    book_new: jest.fn(),
    json_to_sheet: jest.fn(),
    book_append_sheet: jest.fn(),
    write: jest.fn(),
  },
}));

describe("ObjectHistory", () => {
  const objectInfo = {
    Id: "123",
    attributes: {
      type: "CustomObject",
    },
  };

  it("calls getDataFromServer when objectInfo changes", async () => {
    const { rerender } = render(<ObjectHistory objectInfo={objectInfo} />);
    const getDataFromServerSpy = jest.spyOn(
      ObjectHistory.prototype,
      "getDataFromServer"
    );
    rerender(<ObjectHistory objectInfo={{ ...objectInfo, Id: "456" }} />);
    await waitFor(() => expect(getDataFromServerSpy).toHaveBeenCalledTimes(1));
  });

  it("throws an error when Field History Tracking is not enabled", async () => {
    const getMetaDataByIdSpy = jest.spyOn(
      "@/lib/Salesforce",
      "getMetaDataById"
    );
    getMetaDataByIdSpy.mockResolvedValueOnce({ enableHistory: false });
    const { getByText } = render(<ObjectHistory objectInfo={objectInfo} />);
    await waitFor(() =>
      expect(
        getByText(
          "Error: Please enable Field History Tracking to get the data."
        )
      ).toBeInTheDocument()
    );
  });

  it("returns data when Field History Tracking is enabled", async () => {
    const getMetaDataByIdSpy = jest.spyOn(
      "@/lib/Salesforce",
      "getMetaDataById"
    );
    getMetaDataByIdSpy.mockResolvedValueOnce({ enableHistory: true });
    const getTopicSpy = jest.spyOn("@/lib/Salesforce", "getTopic");
    getTopicSpy.mockResolvedValueOnce([{ records: [{ Id: "123" }] }]);
    const { getByText } = render(<ObjectHistory objectInfo={objectInfo} />);
    await waitFor(() =>
      expect(getByText("History for 123")).toBeInTheDocument()
    );
  });

  it("creates a new excel file with the correct data", async () => {
    const onDownloadSpy = jest.spyOn(ObjectHistory.prototype, "onDownload");
    const { getByText } = render(<ObjectHistory objectInfo={objectInfo} />);
    const downloadButton = getByText("Download");
    fireEvent.click(downloadButton);
    await waitFor(() => expect(onDownloadSpy).toHaveBeenCalledTimes(1));
  });

  it("renders correctly when data is available", async () => {
    const getMetaDataByIdSpy = jest.spyOn(
      "@/lib/Salesforce",
      "getMetaDataById"
    );
    getMetaDataByIdSpy.mockResolvedValueOnce({ enableHistory: true });
    const getTopicSpy = jest.spyOn("@/lib/Salesforce", "getTopic");
    getTopicSpy.mockResolvedValueOnce([{ records: [{ Id: "123" }] }]);
    const { getByText } = render(<ObjectHistory objectInfo={objectInfo} />);
    await waitFor(() =>
      expect(getByText("History for 123")).toBeInTheDocument()
    );
  });

  it("renders an error message when data is not available", async () => {
    const getMetaDataByIdSpy = jest.spyOn(
      "@/lib/Salesforce",
      "getMetaDataById"
    );
    getMetaDataByIdSpy.mockResolvedValueOnce({ enableHistory: false });
    const { getByText } = render(<ObjectHistory objectInfo={objectInfo} />);
    await waitFor(() =>
      expect(
        getByText(
          "Error: Please enable Field History Tracking to get the data."
        )
      ).toBeInTheDocument()
    );
  });

  it("renders a loading indicator when data is being fetched", async () => {
    const { getByText } = render(<ObjectHistory objectInfo={objectInfo} />);
    await waitFor(() => expect(getByText("Loading...")).toBeInTheDocument());
  });
});
