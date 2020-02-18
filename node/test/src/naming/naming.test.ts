import { assert } from 'chai';
import 'mocha';

import { AnySpecification, Kind } from '../../../src/laboratory';

import {
  collectionFromKind,
  createRunId,
  encodeAndVerify,
  getCollectionTable,
  getPath,
  getResultsTable,
  specToId,
  specToPath,
} from '../../../src/naming';

describe('naming', () => {
  describe('encodeAndVerify()', () => {
    // TODO: use rewire
    it('names converted to lowercase', () => {
      const input = 'ABC';
      const expected = 'abc';
      const observed = encodeAndVerify(input);
      assert.equal(observed, expected);
    });

    it('blocks invalid characters', () => {
      // There's no good way to verify that it blocks all
      // illegal characters. At least check for some common
      // cases here.
      const inputs = [
        'hello-123',
        'hello.123',
        'hello/123',
        'hello*123',
        'hello_123',
      ];
      for (const input of inputs) {
        const f = () => encodeAndVerify(input);
        assert.throws(f);
      }
    });

    it('blocks short names', () => {
      const inputs = ['', 'a', 'ab'];
      for (const input of inputs) {
        const f = () => encodeAndVerify(input);
        assert.throws(f);
      }
    });

    it('blocks long names', () => {
      // Ensure we don't throw on length of 64.
      const input63 = 'a'.repeat(63);
      encodeAndVerify(input63);

      // Ensure we do throw on length 65.
      const input65 = 'a'.repeat(65);
      const f = () => encodeAndVerify(input65);
      assert.throws(f);
    });
  });

  describe('getPath()', () => {
    it('supported Kind', () => {
      const cases = [
        { input: Kind.BENCHMARK, expected: '/benchmarks/name' },
        { input: Kind.CANDIDATE, expected: '/candidates/name' },
        { input: Kind.SUITE, expected: '/suites/name' },
        { input: Kind.RUN, expected: '/runs/name' },
      ];

      for (const c of cases) {
        const observed = getPath(c.input, 'name');
        assert.equal(observed, c.expected);
      }
    });

    it('unsupported Kind', () => {
      const supported = [Kind.BENCHMARK, Kind.CANDIDATE, Kind.SUITE, Kind.RUN];

      for (const kind of Object.values(Kind)) {
        if (!supported.includes(kind)) {
          const f = () => getPath(kind, 'name');
          assert.throws(f);
        }
      }
    });
  });

  describe('collectionFromKind()', () => {
    // TODO: use rewire
    it('supported Kind', () => {
      const cases = [
        { input: Kind.BENCHMARK, expected: 'benchmarks' },
        { input: Kind.CANDIDATE, expected: 'candidates' },
        { input: Kind.SUITE, expected: 'suites' },
        { input: Kind.RUN, expected: 'runs' },
      ];

      for (const c of cases) {
        const observed = collectionFromKind(c.input);
        assert.equal(observed, c.expected);
      }
    });

    it('unsupported Kind', () => {
      const supported = [Kind.BENCHMARK, Kind.CANDIDATE, Kind.SUITE, Kind.RUN];

      for (const kind of Object.values(Kind)) {
        if (!supported.includes(kind)) {
          const f = () => collectionFromKind(kind);
          assert.throws(f);
        }
      }
    });
  });

  describe('specToId() + specToPath()', () => {
    it('supported specs', () => {
      interface Case {
        spec: AnySpecification;
        expectedId: string;
        expectedPath: string;
      }
      const cases: Case[] = [
        {
          spec: {
            apiVersion: '0.0.1',
            kind: Kind.BENCHMARK,

            creator: 'creator',
            creationDate: 'timestamp',

            name: 'benchmark',
            image: 'image',
            columns: [],
          },
          expectedId: 'benchmark',
          expectedPath: '/benchmarks/benchmark',
        },
        {
          spec: {
            apiVersion: '0.0.1',
            kind: Kind.CANDIDATE,

            creator: 'creator',
            creationDate: 'timestamp',

            name: 'candidate',

            benchmarkId: 'benchmark',
            image: 'image',
          },
          expectedId: 'candidate',
          expectedPath: '/candidates/candidate',
        },
        {
          spec: {
            apiVersion: '0.0.1',
            kind: Kind.RUN,

            creator: 'creator',
            creationDate: 'timestamp',

            benchmarkId: 'benchmark',
            candidateId: 'candidate',
            suiteId: 'suite',

            runId: 'r1234',
          },
          expectedId: 'r1234',
          expectedPath: '/runs/r1234',
        },
        {
          spec: {
            apiVersion: '0.0.1',
            kind: Kind.SUITE,

            creator: 'creator',
            creationDate: 'timestamp',

            name: 'suite',

            benchmarkId: 'benchmark',
          },
          expectedId: 'suite',
          expectedPath: '/suites/suite',
        },
      ];

      for (const c of cases) {
        const observed = specToId(c.spec);
        assert.equal(observed, c.expectedId);

        const observedPath = specToPath(c.spec);
        assert.equal(observedPath, c.expectedPath);
      }
    });
  });

  describe('createRunId()', () => {
    it('generates 10 correct names', () => {
      // There's no way to exhaustively test this, since it is based
      // on uids. Therefore, just try 10 times.
      for (let i = 0; i < 10; ++i) {
        const id = createRunId();
        assert.isNotNull(id.match(/r[0-9]+/));
      }
    });
  });

  describe('getCollectionTable()', () => {
    it('supported collections', () => {
      interface Case {
        input: string;
        expected: string;
      }
      const supported: Case[] = [
        { input: 'benchmarks', expected: 'benchmarks' },
        { input: 'candidates', expected: 'candidates' },
        { input: 'runs', expected: 'runs' },
        { input: 'suites', expected: 'suites' },
      ];

      for (const c of supported) {
        const observed = getCollectionTable(c.input);
        assert.equal(observed, c.expected);
      }
    });

    it('unsupported collections', () => {
      interface Case {
        input: string;
        expected: string;
      }
      const names = ['foobar', 'logs', 'whitelist', 'laboratory'];

      for (const n of names) {
        const f = () => getCollectionTable(n);
        assert.throws(f);
      }
    });
  });

  describe('getResultsTable()', () => {
    it('correct table name', () => {
      const benchmarks = [
        'abc',

        // This case has 63 characters to allow for the prepended
        // character added by getResultsTable().
        'a12345678901234567890123456789012345678901234567890123456789012',

        'table',
        'benchmarks',
        'candidates',
        'runs',
        'suites',
      ];

      for (const b of benchmarks) {
        const table = getResultsTable(b);
        assert.isNotNull(table.match(/[a-z][a-z0-9]{2,62}$/));
      }
    });
  });
});
