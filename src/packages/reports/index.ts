import { report as scrollReport } from "src/packages/reports/scroll";

export const reportExecutors = {
  scroll: scrollReport,
  symbolic: () => {},
};
