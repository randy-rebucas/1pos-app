import { Redirect } from "expo-router";

/** Default customer URL: tab shell (auth enforced in _layout). */
export default function CustomerEntryRedirect() {
  return <Redirect href="/(customer)/(tabs)" />;
}
