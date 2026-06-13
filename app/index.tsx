import { Redirect } from "expo-router";

/** POS entry: staff store selection (auth in `/(staff)/_layout`). */
export default function Index() {
  return <Redirect href="/(staff)/store-select" />;
}
