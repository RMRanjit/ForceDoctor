"use client";
import { getTopic } from "@/lib/Salesforce";
import { useState, useEffect } from "react";
import { CalendarTooltipProps, ResponsiveCalendar } from "@nivo/calendar";
import { ResponsivePie } from "@nivo/pie";
import { Loader } from "lucide-react";
import { DonutChart } from "../chart/DonutChart";
import { Calendar } from "../chart/Calendar";

type Props = {
  objectInfo: any;
};
interface CalendarDataItem {
  value: number;
  day: string;
}
interface PieDataItem {
  id: string;
  label: string;
  value: number;
}

interface LoginHistoryItem {
  attributes: {
    type: string;
    url: string;
  };
  SourceIp: string;
  LoginTime: string;
  UserId: string;
  Browser: string;
  Application: string;
  LoginType: string;
  Status: string;
  LoginGeo: {
    attributes: {
      type: string;
      url: string;
    };
    City: string;
    Country: string;
  };
}

export default function LoginHistoryData({ objectInfo }: Props) {
  const [data, setData] = useState<LoginHistoryItem[] | undefined>();
  const [calendarData, setCalendarData] = useState<CalendarDataItem[]>([]);
  // const [browserData, setBrowserData] = useState<PieDataItem[]>([]);
  const [applicationData, setApplicationData] = useState<PieDataItem[]>([]);
  const [loginTypeData, setLoginTypeData] = useState<PieDataItem[]>([]);
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: "",
    to: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const processData = (loginData: LoginHistoryItem[]) => {
      console.log("Inside ProcessData");
      const countMap: { [key: string]: number } = {};
      let minDate = new Date();
      let maxDate = new Date(0);

      loginData.forEach((item) => {
        const date = new Date(item.LoginTime);
        const dateStr = date.toISOString().split("T")[0];

        countMap[dateStr] = (countMap[dateStr] || 0) + 1;

        if (date < minDate) minDate = date;
        if (date > maxDate) maxDate = date;
      });

      const processedData: CalendarDataItem[] = Object.entries(countMap).map(
        ([day, value]) => ({
          day,
          value,
        })
      );
      console.log("Processed Data: ", processedData);

      setCalendarData(processedData);
      setDateRange({
        from: minDate.toISOString().split("T")[0],
        to: maxDate.toISOString().split("T")[0],
      });
    };

    const getLoginHistoryDataFromServer = async () => {
      setIsLoading(true);
      console.log("LoginHistory: useEffect: objectInfo", objectInfo);
      const res = await getTopic("loginHistoryForUser", {
        UserId: objectInfo.Id,
      });
      console.log("Login History Data: ", res);
      //@ts-ignore
      processData(res[0].records);
      // processOtherData(res[0].records);
      //@ts-ignore
      setData(res[0]);
      setIsLoading(false);
    };

    getLoginHistoryDataFromServer();
  }, [objectInfo]);

  if (isLoading) return <Loader className="h-8 w-8 animate-spin" />;
  else
    return (
      <>
        <span className="text-lg font-semibold">
          Login History for {objectInfo.Name}
        </span>
        <div className="w-full">
          <text>Login Trends</text>
          {/* {calendarData.length > 0 && (
            <ResponsiveCalendar
              data={calendarData}
              from={dateRange.from}
              to={dateRange.to}
              // emptyColor="#eeeeee"
              // colors={ scheme: "greys" }
              colors={["#61cdbb", "#97e3d5", "#e8c1a0", "#f47560"]}
              margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
              yearSpacing={20}
              monthSpacing={20}
              // monthBorderColor="#ffffff"
              dayBorderWidth={0.5}
              monthBorderWidth={0.5}
              // dayBorderColor="#ffffff"
              tooltip={(n: CalendarTooltipProps) => {
                if (n.value === undefined) return null;
                console.log(n);
                return (
                  <div className="bg-secondary text-xs">
                    {n.value} Logins on
                    {n.date.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                );
              }}
            />
          )} */}
          <div className="h-[300px]">
          {
            //@ts-ignore
            data && data.records.length && (
              //@ts-ignore
              <Calendar data={data.records} dateColumn="LoginTime" />
            )
          }
          </div>
          <div className="grid grid-flow-col">
            {
              //@ts-ignore
              data?.records.length > 0 && (
                <div className="grid grid-flow-row grid-cols-3">
                  <DonutChart
                    //@ts-ignore
                    data={data?.records}
                    idKey="LoginType"
                    title="Login Type"
                    showLegend={false}
                  />
                  <DonutChart
                    //@ts-ignore
                    data={data.records}
                    idKey="Application"
                    title="Apps Used"
                  />
                  <DonutChart
                    //@ts-ignore
                    data={data.records}
                    idKey="Browser"
                    title="Browsers used"
                  />
                </div>
              )
            }
          </div>
        </div>
      </>
    );
}

// const processOtherData = (loginData: LoginHistoryItem[]) => {
//   const browserCount: { [key: string]: number } = {};
//   const applicationCount: { [key: string]: number } = {};
//   const loginTypeCount: { [key: string]: number } = {};

//   loginData.forEach((item) => {
//     const browser = item.Browser;
//     const application = item.Application;
//     const loginType = item.LoginType;
//     browserCount[browser] = (browserCount[browser] || 0) + 1;
//     applicationCount[application] =
//       (applicationCount[application] || 0) + 1;
//     loginTypeCount[loginType] = (loginTypeCount[loginType] || 0) + 1;
//   });

//   const processedBrowserData: PieDataItem[] = Object.entries(
//     browserCount
//   ).map(([browser, count]) => ({
//     id: browser,
//     label: browser,
//     value: count,
//   }));
//   const processedApplicationData: PieDataItem[] = Object.entries(
//     applicationCount
//   ).map(([application, count]) => ({
//     id: application,
//     label: application,
//     value: count,
//   }));

//   const processedLoginTypeData: PieDataItem[] = Object.entries(
//     applicationCount
//   ).map(([loginType, count]) => ({
//     id: loginType,
//     label: loginType,
//     value: count,
//   }));
//   console.log("Browser Data: ", processedBrowserData);
//   // setBrowserData(processedBrowserData);
//   setApplicationData(processedApplicationData);
//   setLoginTypeData(processedLoginTypeData);
// };

{
  /* {applicationData.length > 0 && (
            <div className="h-[400px] w-full">
              <text className="text-xs"> Applications Used</text>
              <ResponsivePie
                data={applicationData}
                margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                colors={{ scheme: "nivo" }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                borderWidth={1}
                borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#333333"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: "color" }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor={{
                  from: "color",
                  modifiers: [["darker", 2]],
                }}
                defs={[
                  {
                    id: "dots",
                    type: "patternDots",
                    background: "inherit",
                    color: "rgba(255, 255, 255, 0.3)",
                    size: 4,
                    padding: 1,
                    stagger: true,
                  },
                  {
                    id: "lines",
                    type: "patternLines",
                    background: "inherit",
                    color: "rgba(255, 255, 255, 0.3)",
                    rotation: -45,
                    lineWidth: 6,
                    spacing: 10,
                  },
                ]}
                legends={[
                  {
                    anchor: "bottom",
                    direction: "row",
                    justify: false,
                    translateX: 0,
                    translateY: 56,
                    itemsSpacing: 0,
                    itemWidth: 100,
                    itemHeight: 18,
                    itemTextColor: "#999",
                    itemDirection: "left-to-right",
                    itemOpacity: 1,
                    symbolSize: 18,
                    symbolShape: "circle",
                    effects: [
                      {
                        on: "hover",
                        style: {
                          itemTextColor: "#000",
                        },
                      },
                    ],
                  },
                ]}
              />
            </div>
          )}
          {loginTypeData.length > 0 && (
            <div className="h-[400px] w-full">
              <text className="text-xs"> Login Types</text>
              <ResponsivePie
                data={loginTypeData}
                margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                colors={{ scheme: "nivo" }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                borderWidth={1}
                borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#333333"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: "color" }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor={{
                  from: "color",
                  modifiers: [["darker", 2]],
                }}
                defs={[
                  {
                    id: "dots",
                    type: "patternDots",
                    background: "inherit",
                    color: "rgba(255, 255, 255, 0.3)",
                    size: 4,
                    padding: 1,
                    stagger: true,
                  },
                  {
                    id: "lines",
                    type: "patternLines",
                    background: "inherit",
                    color: "rgba(255, 255, 255, 0.3)",
                    rotation: -45,
                    lineWidth: 6,
                    spacing: 10,
                  },
                ]}
                legends={[
                  {
                    anchor: "bottom",
                    direction: "row",
                    justify: false,
                    translateX: 0,
                    translateY: 56,
                    itemsSpacing: 0,
                    itemWidth: 100,
                    itemHeight: 18,
                    itemTextColor: "#999",
                    itemDirection: "left-to-right",
                    itemOpacity: 1,
                    symbolSize: 18,
                    symbolShape: "circle",
                    effects: [
                      {
                        on: "hover",
                        style: {
                          itemTextColor: "#000",
                        },
                      },
                    ],
                  },
                ]}
              />
            </div>
          )} */
}
