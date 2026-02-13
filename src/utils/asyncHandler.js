// const asyncHandler = (fun) => {
//   return async (req, res, next) => {
//     try {
//       await fun(req, res, next);
//     } catch (error) {
//       next(error);
//     }
//   };
// };

const asyncHandler = (fun) => {
  return (req, res, next) => {
    Promise.resolve(fun(req, res, next)).catch((error) => next(error));
  };
};

export { asyncHandler };
