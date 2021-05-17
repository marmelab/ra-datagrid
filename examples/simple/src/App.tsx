import * as RA from "react-admin";
import generateData from "data-generator-retail";
import fakerestDataProvider from "ra-data-fakerest";
import { CustomerList } from "./CustomerList";

export default function App() {
  return (
    <RA.Admin dataProvider={fakerestDataProvider(generateData(), true)}>
      <RA.Resource name="customers" list={CustomerList} />
    </RA.Admin>
  );
}
