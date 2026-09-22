import {it,expect} from 'vitest';
import {emptySnapshot,registry} from '../src/core/sources';

it('v2 snapshot contract starts new protocol collections as unknown/empty',()=>{
  const s:any=emptySnapshot();
  expect(s.networkModels).toEqual([]);
  expect(s.governanceModels).toEqual([]);
  expect(s.pocModels).toEqual([]);
  expect(s.devshardVersions).toEqual([]);
  expect(s.versions).toEqual({});
  expect(s.endpointDeclaredTotal).toBeNull();
});
it('registers chain model/version sources separately from provider model data',()=>{
  expect(registry.map(x=>x.id)).toEqual(expect.arrayContaining(['models','networkModels','governanceModels','versions']));
  expect(registry.find(x=>x.id==='models')?.scope).toBe('provider');
  expect(registry.find(x=>x.id==='networkModels')?.scope).toBe('chain');
});
