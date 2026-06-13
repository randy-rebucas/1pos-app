import { Redirect } from "expo-router";

/** Client app entry: customer booking (auth in `/(customer)/_layout`). Staff: `/(staff)`. */
export default function Index() {
  return <Redirect href="/(customer)" />;
}
