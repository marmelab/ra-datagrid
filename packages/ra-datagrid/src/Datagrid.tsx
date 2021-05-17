import * as React from "react";
import * as RA from "react-admin";
import {
  DataGrid as MuiDatagrid,
  DataGridProps as MuiDatagridProps,
  GridSortModel,
  GridSortModelParams,
  GridPageChangeParams,
  GridFilterItem,
  GridFilterModel,
  GridFilterModelParams,
  GridSelectionModelChangeParams,
  GridEditCellPropsParams,
  GridFilterModelState,
  getGridStringOperators,
} from "@material-ui/data-grid";
import isEqual from "lodash/isEqual";

const operatorParamsToModel = new Map([
  // boolean operators
  ["is", "is"],
  ["not", "not"],
  // date operators
  ["after", "after"],
  ["onOrAfter", "onOrAfter"],
  ["before", "before"],
  ["onOrBefore", "onOrBefore"],
  // numeric operators
  ["eq", "="],
  ["neq", "!="],
  ["gt", ">"],
  ["gte", ">="],
  ["lt", "<"],
  ["lte", "<="],
  // string operators
  ["contains", "contains"],
  // ["equals", "equals"], // default operator
  ["sw", "startsWith"],
  ["ew", "endsWith"],
]);

const operatorModelToParams = new Map(
  Array.from(operatorParamsToModel, (entry) => [entry[1], entry[0]])
);

const operatorTest = /(.+)_(\w+)$/;

export const defaultConvertFilterValuesToFilterModel = (
  filterValues: any
): GridFilterItem[] =>
  Object.keys(filterValues).map((name) => {
    const match = name.match(operatorTest);
    if (!match) {
      return {
        columnField: name,
        operatorValue: "equals",
        value: filterValues[name],
      };
    }
    const [, realName, operator] = match;
    if (operatorParamsToModel.has(operator)) {
      return {
        columnField: realName,
        operatorValue: operatorParamsToModel.get(operator),
        value: filterValues[name],
      };
    } else {
      return {
        columnField: name,
        operatorValue: "equals",
        value: filterValues[name],
      };
    }
  });

export const defaultConvertFilterModelToFilterValues = (
  filterModel: GridFilterModelState
): any =>
  filterModel.items.reduce<any>((acc, item) => {
    if (typeof item.columnField !== "undefined" && item.operatorValue) {
      if (operatorModelToParams.has(item.operatorValue)) {
        acc[
          `${item.columnField}_${operatorModelToParams.get(item.operatorValue)}`
        ] = item.value;
      } else {
        acc[item.columnField] = item.value;
      }
    }
    return acc;
  }, {});

export const simpleFilterOperator = getGridStringOperators().filter(
  (operator: any) => operator.value === "equals"
);

export interface DatagridProps extends Omit<MuiDatagridProps, "rows"> {
  convertFilterValuesToFilterModel?: (filterValues: any) => GridFilterItem[];
  convertFilterModelToFilterValues?: (filterModel: GridFilterModelState) => any;
}

export const Datagrid = (props: DatagridProps) => {
  const {
    columns,
    convertFilterValuesToFilterModel = defaultConvertFilterValuesToFilterModel,
    convertFilterModelToFilterValues = defaultConvertFilterModelToFilterValues,
  } = props;
  const {
    // data
    ids,
    data,
    total,
    error,
    loading,
    // sorting
    currentSort,
    setSort,
    // pagination
    page,
    setPage,
    perPage,
    setPerPage,
    // filtering
    filterValues,
    setFilters,
    // selection
    selectedIds,
    onSelect,
  } = RA.useListContext();
  const resource = RA.useResourceContext();
  const notify = RA.useNotify();
  const [update] = RA.useUpdate(resource, "");

  // sorting logic

  const [sortModel, setSortModel] = React.useState<GridSortModel>([
    {
      field: currentSort.field,
      sort: currentSort.order.toLowerCase() === "desc" ? "desc" : "asc",
    },
  ]);

  React.useEffect(() => {
    if (
      sortModel[0].field === currentSort.field &&
      sortModel[0].sort === currentSort.order.toLowerCase()
    ) {
      return;
    }
    setSortModel([
      {
        field: currentSort.field,
        sort: currentSort.order.toLowerCase() === "desc" ? "desc" : "asc",
      },
    ]);
  }, [currentSort, sortModel]);

  const handleSortModelChange = (params: GridSortModelParams) => {
    if (params.sortModel.length === 0) {
      // reset sort
      setSort("id", "asc");
      return;
    }
    if (params.sortModel !== sortModel) {
      setSort(
        params.sortModel[0].field,
        params.sortModel[0].sort?.toUpperCase()
      );
    }
  };

  // pagination logic

  const handlePageChange = (params: GridPageChangeParams) => {
    setPage(params.page + 1);
  };

  const handlePageSizeChange = (params: GridPageChangeParams) => {
    setPerPage(params.pageSize);
  };

  // filtering logic

  const [filterModel, setFilterModel] = React.useState<GridFilterModel>({
    items: convertFilterValuesToFilterModel(filterValues),
  });

  React.useEffect(() => {
    const filterItems = convertFilterValuesToFilterModel(filterValues);
    if (isEqual(filterModel.items, filterItems)) {
      return;
    }
    setFilterModel({
      items: filterItems,
    });
  }, [filterValues, filterModel]);

  const handleFilterChange = (params: GridFilterModelParams) => {
    setFilters(convertFilterModelToFilterValues(params.filterModel), {});
  };

  // selection logic

  const handleSelectionChange = (params: GridSelectionModelChangeParams) => {
    onSelect(params.selectionModel);
  };

  // edition logic

  const handleEditCellChangeCommitted = (params: GridEditCellPropsParams) => {
    update(
      {
        payload: {
          id: params.id,
          data: {
            [params.field]: params.props.value,
          },
          previousData: data[params.id],
        },
      },
      {
        onFailure: (error) => {
          notify(
            typeof error === "string"
              ? error
              : error.message || "ra.notification.http_error",
            "warning",
            {
              _:
                typeof error === "string"
                  ? error
                  : error && error.message
                  ? error.message
                  : undefined,
            }
          );
        },
      }
    );
  };

  const rest: unknown = RA.sanitizeListRestProps(props);

  return (
    <MuiDatagrid
      columns={columns}
      autoHeight
      density="compact"
      disableSelectionOnClick
      // data
      rows={ids.map((id) => data[id])}
      loading={loading}
      error={error}
      // sorting
      sortingMode="server"
      sortModel={sortModel}
      onSortModelChange={handleSortModelChange}
      // pagination
      paginationMode="server"
      page={page - 1}
      pageSize={perPage}
      rowCount={total}
      rowsPerPageOptions={[5, 10, 20]}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      // filtering
      filterMode="server"
      filterModel={filterModel}
      onFilterModelChange={handleFilterChange}
      // selection
      checkboxSelection
      hideFooterSelectedRowCount
      selectionModel={selectedIds}
      onSelectionModelChange={handleSelectionChange}
      // edition
      onEditCellChangeCommitted={handleEditCellChangeCommitted}
      {...rest}
    />
  );
};
