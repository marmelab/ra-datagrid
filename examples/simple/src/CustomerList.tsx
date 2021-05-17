import * as RA from "react-admin";
import { GridColDef, GridValueGetterParams } from "@material-ui/data-grid";
import { Datagrid, simpleFilterOperator } from "ra-datagrid";

const columns: GridColDef[] = [
  {
    field: "id",
    headerName: "Id",
    type: "string",
    width: 100,
    disableClickEventBubbling: true,
    filterOperators: simpleFilterOperator,
  },
  {
    field: "last_name",
    headerName: "Full name",
    description: "This column has a value getter and is not sortable.",
    sortable: true,
    flex: 1,
    valueGetter: (params: GridValueGetterParams) =>
      `${params.row.first_name || ""} ${params.row.last_name || ""}`,
    disableClickEventBubbling: true,
  },
  {
    field: "last_seen",
    headerName: "Last seen",
    type: "date",
    valueGetter: (params: GridValueGetterParams) =>
      new Date(params.row.last_seen || ""),
    width: 160,
    disableClickEventBubbling: true,
    editable: true,
    filterOperators: simpleFilterOperator,
  },
  {
    field: "total_spent",
    headerName: "Spent",
    type: "number",
    width: 150,
    disableClickEventBubbling: true,
    editable: true,
    filterOperators: simpleFilterOperator,
  },
];

export const CustomerList = (props: any) => (
  <RA.List {...props} pagination={false}>
    <Datagrid columns={columns} />
  </RA.List>
);
