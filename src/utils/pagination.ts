import { cloneDeep } from "lodash";

export const paginate = (page, itemsPerPage, list) => {
  let start = getStart(page, itemsPerPage);
  let end = getEnd(start, itemsPerPage, list);

  var items = cloneDeep(list);
  items = items.slice(start, end);

  let paginated = {
    start: start,
    end: end,
    items: items,
  };

  return paginated;
};
export const paginateServer = (page, itemsPerPage, list, total) => {
  let start = getStart(page, itemsPerPage);
  let end = getEndServer(start, itemsPerPage, total);

  var items = cloneDeep(list);
  items = items.slice(start, end);

  let paginated = {
    start: start,
    end: end,
    items: items,
  };

  return paginated;
};

export const getPaginationText = (start, end, totalCount, list) => {
  let range = list.length > 0 ? start + " - " + end : 0;
  return range + " / " + totalCount;
};

export const getStart = (page, itemsPerPage) => {
  return Math.max((page - 1) * itemsPerPage, 0);
};

export const getEnd = (start, itemsPerPage, list) => {
  return Math.min(start + itemsPerPage, list.length);
};

export const getEndServer = (start, itemsPerPage, total) => {
  return Math.min(start + itemsPerPage, total);
};
