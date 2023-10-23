import { addH1 } from "./h1";
import isNumber from "is-number";
// @ts-ignore

// imoprt numberCheck from remote module
import("Remote/Hello" as any).then(() => {
  console.log("YO");
});

addH1("Hello, World 123!");
