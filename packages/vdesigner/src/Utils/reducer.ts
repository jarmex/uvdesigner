interface IFetchReducer {
  loading: boolean;
  error: Error | null;
  data: any;
}

export const initResponse: IFetchReducer = {
  data: null,
  loading: false,
  error: null,
};

export const actions = {
  init: "FETCH_INITIAL",
  fail: "FETCH_FAILED",
  success: "FETCH_SUCCESS",
  start: "FETCH_START",
};

export enum ActionTypes {
  Init = "INIT",
  Success = "SUCCESS",
  Fail = "FAILED",
  Start = "START",
}

type Action =
  | { type: ActionTypes.Init }
  | { type: ActionTypes.Success; payload: any }
  | { type: ActionTypes.Start }
  | { type: ActionTypes.Fail; payload: Error };

export const fetchReducer = (state: IFetchReducer, action: Action) => {
  switch (action.type) {
    case ActionTypes.Start:
      return { ...state, loading: true, data: null, error: null };
    case ActionTypes.Init:
      return { ...state, loading: true, error: null, data: null };
    case ActionTypes.Fail:
      return {
        ...state,
        error: action.payload,
        data: null,
        loading: false,
      };
    case ActionTypes.Success:
      return {
        ...state,
        loading: false,
        data: action.payload,
        error: null,
      };
    default:
      return { ...state };
  }
};
