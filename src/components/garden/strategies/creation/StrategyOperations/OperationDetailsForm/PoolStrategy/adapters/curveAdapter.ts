import { curve, convex, yearn, pickle, aladdin } from 'constants/addresses';

export const getCurvePoolsFromResponse = (response: any) => {
  if (response.pools) {
    const allCurvePools = {
      ...curve.pools.v3,
      ...curve.pools.factory,
      ...curve.pools.crypto,
      ...curve.pools.cryptofactory,
    };
    return Object.keys(allCurvePools).map((curveName: string) => {
      const stakeable: string[] = [];
      const poolId = allCurvePools[curveName];
      if (convex.pools.find((c: any) => c.crvpool.toLowerCase() === poolId.toLowerCase())) {
        stakeable.push('convex');
      }
      if (yearn.vaults.find((v: any) => v.crvpool?.toLowerCase() === poolId.toLowerCase())) {
        stakeable.push('yearn');
      }
      if (pickle.jars.find((v: any) => v.crvpool?.toLowerCase() === poolId.toLowerCase())) {
        stakeable.push('pickle');
      }
      if (aladdin.pools.find((p: any) => p.crvpool?.toLowerCase() === poolId.toLowerCase())) {
        stakeable.push('aladdin');
      }
      if (curve.pools.gaugeBlacklist.indexOf(poolId) === -1) {
        stakeable.push('curve');
      }
      return {
        id: poolId,
        name: `${curveName} crv pool`,
        stakeable,
      };
    });
  }
  return [];
};

export const buildCurvePoolsQuery: any = async (_: any) => {
  return {};
};
