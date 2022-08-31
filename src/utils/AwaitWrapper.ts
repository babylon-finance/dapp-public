function to(promise, errorExt = {}) {
  return promise
    .then(function (data) {
      return [null, data];
    })
    .catch(function (err) {
      if (errorExt) {
        Object.assign(err, errorExt);
      }
      return [err, undefined];
    });
}

export async function wrapAwait(f: Promise<unknown>, defaultValue: any, additionalError: string = '') {
  const [err, data] = await to(f);
  if (err) {
    console.error(`Error calling ${additionalError}`, f, err);
    return defaultValue;
  }
  return data;
}
