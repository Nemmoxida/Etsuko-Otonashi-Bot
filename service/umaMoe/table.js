import AsciiTable from "ascii-table";
// import data from "./cleanedCircleData.json" with { type: "json" };

// as the name implies this function is for shortening a number and adding a unit
export function shortenNumber(n, d = 1) {
  // d is used to determine how many decimal number
  const number = Number(n);

  const units = [
    { value: 1_000_000_000, suffix: "b" },
    { value: 1_000_000, suffix: "m" },
    { value: 1_000, suffix: "k" },
  ];

  if (number > 0) {
    for (const unit of units) {
      if (number >= unit.value) {
        return (
          (number / Number(unit.value)).toFixed(d).toString() + unit.suffix
        );
      }
    }
  } else {
    for (const unit of units) {
      if (number <= unit.value * -1) {
        return (
          (number / Number(unit.value)).toFixed(d).toString() + unit.suffix
        );
      }
    }
  }

  return number;
}

export default function createTableUma(data) {
  // table is for above average
  // table2 is for below average
  var table = new AsciiTable();
  var table2 = new AsciiTable();
  let above = 0; // used to determine how many players are above the quota
  let below = 0; // used to determine how many players are below the quota
  const heading = ["Player", "Daily", "Plus", "Total"];

  table.setHeading(heading);
  table2.setHeading(["Player", "Daily", "Minus", "Total"]);
  table.setHeadingAlignLeft();
  table2.setHeadingAlignLeft();
  const sortedData = data;

  for (const item in sortedData) {
    if (shortenNumber(sortedData[item].plus).startsWith("-")) {
      below++;
      table2.addRow(
        sortedData[item].name.length > 18
          ? sortedData[item].name.slice(0, 17)
          : sortedData[item].name,
        shortenNumber(sortedData[item].daily),
        shortenNumber(sortedData[item].plus),
        shortenNumber(sortedData[item].totalThisMonth),
      );
    } else {
      above++;
      table.addRow(
        sortedData[item].name.length > 18
          ? sortedData[item].name.slice(0, 17)
          : sortedData[item].name,
        shortenNumber(sortedData[item].daily),
        "+" + shortenNumber(sortedData[item].plus),
        shortenNumber(sortedData[item].totalThisMonth),
      );
    }
  }

  table.removeBorder();
  table2.removeBorder();
  table.setBorder(" ", "-");
  table2.setBorder(" ", "-");
  for (const item in heading) {
    table.setAlignLeft(item);
  }
  for (const item in heading) {
    table2.setAlignLeft(item);
  }

  const arrTable = [
    table.__rows.length == 0 ? false : table.toString(),
    table2.__rows.length == 0 ? false : table2.toString(),
    above,
    below,
  ];

  return arrTable;
}

// createTableUma();
