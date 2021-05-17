# ra-datagrid

Integration of [Material-ui's `<Datagrid>`](https://material-ui.com/components/data-grid/) into react-admin.

## Features

- Server-side filtering, sorting and pagination via the `dataProvider`
- Row selection
- Cell editing
- Hide / show columns
- All the material-ui `<Datagrid>` features (additional props are passed down to it)

## Usage

Replace react-admin's `<Datagrid>` by the one exported by this package. Make sure you set `pagination={false}` on the list as the Datagrid embarks its own pagination. 

```tsx
import { List } from "react-admin";
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
  <List {...props} pagination={false}>
    <Datagrid columns={columns} />
  </List>
);
```

## Contributing

```sh
## install dependencies for core package and example
yarn install
## build JS from ts
yarn build
## run example
yarn start
```

## License

MIT, sponsored by marmelab