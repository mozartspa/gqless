import { createTestApp, gql } from 'test-utils';

import { generate } from '../src';

export const clientPreComment = '';

test('basic functionality works', async () => {
  const { server, isReady } = createTestApp({
    schema: gql`
      "Query"
      type Query {
        "Hello field"
        hello: String!
        deprecatedArg(arg: Int = 123): Int @deprecated
      }
    `,
    resolvers: {
      Query: {
        hello() {
          return 'hello world';
        },
      },
    },
  });

  await isReady;

  const shouldBeIncluded = '// This should be included';

  const { schemaCode, clientCode, generatedSchema, scalarsEnumsHash } =
    await generate(server.graphql.schema, {
      preImport: `
        ${shouldBeIncluded}
        `,
      react: true,
      subscriptions: true,
    });

  expect(schemaCode).toMatchInlineSnapshot(`
    "/**
     * GQLESS AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
     */

    // This should be included

    export type Maybe<T> = T | null;
    export type Exact<T extends { [key: string]: unknown }> = {
      [K in keyof T]: T[K];
    };
    export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
      { [SubKey in K]?: Maybe<T[SubKey]> };
    export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
      { [SubKey in K]: Maybe<T[SubKey]> };
    /** All built-in and custom scalars, mapped to their actual values */
    export interface Scalars {
      ID: string;
      String: string;
      Boolean: boolean;
      Int: number;
      Float: number;
    }

    export const scalarsEnumsHash: import('@mozartspa/gqless').ScalarsEnumsHash = {
      String: true,
      Int: true,
      Boolean: true,
    };
    export const generatedSchema = {
      query: {
        __typename: { __type: 'String!' },
        hello: { __type: 'String!' },
        deprecatedArg: { __type: 'Int', __args: { arg: 'Int' } },
      },
      mutation: {},
      subscription: {},
    } as const;

    /**
     * Query
     */
    export interface Query {
      __typename: 'Query' | undefined;
      /**
       * Hello field
       */
      hello: ScalarsEnums['String'];
      /**
       * @deprecated No longer supported
       */
      deprecatedArg: (args?: {
        /**
         * @defaultValue \`123\`
         */
        arg?: Maybe<Scalars['Int']>;
      }) => Maybe<ScalarsEnums['Int']>;
    }

    export interface Mutation {
      __typename: 'Mutation' | undefined;
    }

    export interface Subscription {
      __typename: 'Subscription' | undefined;
    }

    export interface SchemaObjectTypes {
      Query: Query;
      Mutation: Mutation;
      Subscription: Subscription;
    }
    export type SchemaObjectTypesNames = 'Query' | 'Mutation' | 'Subscription';

    export interface GeneratedSchema {
      query: Query;
      mutation: Mutation;
      subscription: Subscription;
    }

    export type MakeNullable<T> = {
      [K in keyof T]: T[K] | undefined;
    };

    export interface ScalarsEnums extends MakeNullable<Scalars> {}
    "
  `);

  expect(clientCode).toMatchInlineSnapshot(`
    "/**
     * GQLESS: You can safely modify this file and Query Fetcher based on your needs
     */

    import { createReactClient } from '@mozartspa/gqless-react';
    import { createSubscriptionsClient } from '@mozartspa/gqless-subscriptions';
    import { createClient, QueryFetcher } from '@mozartspa/gqless';
    import {
      generatedSchema,
      scalarsEnumsHash,
      GeneratedSchema,
      SchemaObjectTypes,
      SchemaObjectTypesNames,
    } from './schema.generated';

    const queryFetcher: QueryFetcher = async function (query, variables) {
      // Modify \\"/api/graphql\\" if needed
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
        mode: 'cors',
      });

      const json = await response.json();

      return json;
    };

    const subscriptionsClient =
      typeof window !== 'undefined'
        ? createSubscriptionsClient({
            wsEndpoint: () => {
              // Modify if needed
              const url = new URL('/api/graphql', window.location.href);
              url.protocol = url.protocol.replace('http', 'ws');
              return url.href;
            },
          })
        : undefined;

    export const client = createClient<
      GeneratedSchema,
      SchemaObjectTypesNames,
      SchemaObjectTypes
    >({
      schema: generatedSchema,
      scalarsEnumsHash,
      queryFetcher,
      subscriptionsClient,
    });

    export const { query, mutation, mutate, subscription, resolved, refetch } =
      client;

    export const {
      graphql,
      useQuery,
      usePaginatedQuery,
      useTransactionQuery,
      useLazyQuery,
      useRefetch,
      useMutation,
      useMetaState,
      prepareReactRender,
      useHydrateCache,
      prepareQuery,
      useSubscription,
    } = createReactClient<GeneratedSchema>(client, {
      defaults: {
        // Set this flag as \\"true\\" if your usage involves React Suspense
        // Keep in mind that you can overwrite it in a per-hook basis
        suspense: false,

        // Set this flag based on your needs
        staleWhileRevalidate: false,
      },
    });

    export * from './schema.generated';
    "
  `);

  expect(JSON.stringify(generatedSchema, null, 2)).toMatchInlineSnapshot(`
    "{
      \\"query\\": {
        \\"__typename\\": {
          \\"__type\\": \\"String!\\"
        },
        \\"hello\\": {
          \\"__type\\": \\"String!\\"
        },
        \\"deprecatedArg\\": {
          \\"__type\\": \\"Int\\",
          \\"__args\\": {
            \\"arg\\": \\"Int\\"
          }
        }
      },
      \\"mutation\\": {},
      \\"subscription\\": {}
    }"
  `);

  expect(JSON.stringify(scalarsEnumsHash, null, 2)).toMatchInlineSnapshot(`
    "{
      \\"String\\": true,
      \\"Int\\": true,
      \\"Boolean\\": true
    }"
  `);

  expect(clientCode.includes('= createReactClient')).toBeTruthy();

  expect(
    schemaCode
      .split('\n')
      .slice(3)
      .join('\n')
      .trim()
      .startsWith(shouldBeIncluded)
  ).toBeTruthy();
});

test('custom scalars works', async () => {
  const { server, isReady } = createTestApp({
    schema: gql`
      scalar Custom
      type Query {
        hello: Custom!
      }
    `,
    resolvers: {
      Query: {
        hello() {
          return 'hello world';
        },
      },
    },
  });

  await isReady;

  const { schemaCode, clientCode, generatedSchema, scalarsEnumsHash } =
    await generate(server.graphql.schema, {
      scalarTypes: {
        Custom: '"hello world"',
      },
    });

  expect(clientCode).toMatchInlineSnapshot(`
    "/**
     * GQLESS: You can safely modify this file and Query Fetcher based on your needs
     */

    import { createReactClient } from '@mozartspa/gqless-react';

    import { createClient, QueryFetcher } from '@mozartspa/gqless';
    import {
      generatedSchema,
      scalarsEnumsHash,
      GeneratedSchema,
      SchemaObjectTypes,
      SchemaObjectTypesNames,
    } from './schema.generated';

    const queryFetcher: QueryFetcher = async function (query, variables) {
      // Modify \\"/api/graphql\\" if needed
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
        mode: 'cors',
      });

      const json = await response.json();

      return json;
    };

    export const client = createClient<
      GeneratedSchema,
      SchemaObjectTypesNames,
      SchemaObjectTypes
    >({
      schema: generatedSchema,
      scalarsEnumsHash,
      queryFetcher,
    });

    export const { query, mutation, mutate, subscription, resolved, refetch } =
      client;

    export const {
      graphql,
      useQuery,
      usePaginatedQuery,
      useTransactionQuery,
      useLazyQuery,
      useRefetch,
      useMutation,
      useMetaState,
      prepareReactRender,
      useHydrateCache,
      prepareQuery,
    } = createReactClient<GeneratedSchema>(client, {
      defaults: {
        // Set this flag as \\"true\\" if your usage involves React Suspense
        // Keep in mind that you can overwrite it in a per-hook basis
        suspense: false,

        // Set this flag based on your needs
        staleWhileRevalidate: false,
      },
    });

    export * from './schema.generated';
    "
  `);

  expect(schemaCode).toMatchInlineSnapshot(`
    "/**
     * GQLESS AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
     */

    export type Maybe<T> = T | null;
    export type Exact<T extends { [key: string]: unknown }> = {
      [K in keyof T]: T[K];
    };
    export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
      { [SubKey in K]?: Maybe<T[SubKey]> };
    export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
      { [SubKey in K]: Maybe<T[SubKey]> };
    /** All built-in and custom scalars, mapped to their actual values */
    export interface Scalars {
      ID: string;
      String: string;
      Boolean: boolean;
      Int: number;
      Float: number;
      Custom: 'hello world';
    }

    export const scalarsEnumsHash: import('@mozartspa/gqless').ScalarsEnumsHash = {
      Custom: true,
      Boolean: true,
      String: true,
    };
    export const generatedSchema = {
      query: { __typename: { __type: 'String!' }, hello: { __type: 'Custom!' } },
      mutation: {},
      subscription: {},
    } as const;

    export interface Query {
      __typename: 'Query' | undefined;
      hello: ScalarsEnums['Custom'];
    }

    export interface Mutation {
      __typename: 'Mutation' | undefined;
    }

    export interface Subscription {
      __typename: 'Subscription' | undefined;
    }

    export interface SchemaObjectTypes {
      Query: Query;
      Mutation: Mutation;
      Subscription: Subscription;
    }
    export type SchemaObjectTypesNames = 'Query' | 'Mutation' | 'Subscription';

    export interface GeneratedSchema {
      query: Query;
      mutation: Mutation;
      subscription: Subscription;
    }

    export type MakeNullable<T> = {
      [K in keyof T]: T[K] | undefined;
    };

    export interface ScalarsEnums extends MakeNullable<Scalars> {}
    "
  `);

  expect(JSON.stringify(generatedSchema, null, 2)).toMatchInlineSnapshot(`
    "{
      \\"query\\": {
        \\"__typename\\": {
          \\"__type\\": \\"String!\\"
        },
        \\"hello\\": {
          \\"__type\\": \\"Custom!\\"
        }
      },
      \\"mutation\\": {},
      \\"subscription\\": {}
    }"
  `);

  expect(JSON.stringify(scalarsEnumsHash, null, 2)).toMatchInlineSnapshot(`
    "{
      \\"Custom\\": true,
      \\"Boolean\\": true,
      \\"String\\": true
    }"
  `);

  expect(
    schemaCode.includes(
      `
export interface Scalars {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Custom: 'hello world';
}
`.trim()
    )
  ).toBeTruthy();
});

describe('feature complete app', () => {
  const { server, isReady } = createTestApp({
    schema: gql`
      scalar ExampleScalar

      "Greetings Enum"
      enum GreetingsEnum {
        "Hello"
        Hello
        "Hi"
        Hi
        "Hey"
        Hey
        Bye @deprecated
      }
      enum OtherEnum {
        Other
      }
      "Greetings Input"
      input GreetingsInput {
        "Language"
        language: String!
        value: String = "Hello"
        scal: ExampleScalar
      }
      type Query {
        simpleString: String!
        stringWithArgs(hello: String!): String!
        stringNullableWithArgs(hello: String!, helloTwo: String = "Hi"): String
        stringNullableWithArgsArray(hello: [String]!): String
        object: Human
        objectArray: [Human]
        objectWithArgs("Who?" who: String!): Human!
        arrayString: [String!]!
        arrayObjectArgs(limit: Int = 10): [Human!]!
        greetings: GreetingsEnum!
        giveGreetingsInput(input: GreetingsInput!): String!
        enumsInput(
          nullableEnum: GreetingsEnum
          notNullableEnum: GreetingsEnum!
        ): GreetingsEnum
        number: Int!
      }
      type Mutation {
        increment(n: Int!): Int!
      }
      "Named Entity"
      interface NamedEntity {
        "Named Entity Name"
        name: String!
        other: String
        withArgs(
          """
          A Arg
          """
          a: Int!
          b: Int = 0
        ): Int
        withArgs2(a: Int): Int! @deprecated
      }
      type Human implements NamedEntity {
        name: String!
        other: String
        father: Human!
        fieldWithArgs(id: Int!): Int!
        withArgs(a: Int!, b: Int): Int
        withArgs2(a: Int): Int!
      }
      type OtherHuman {
        name: String!
        other: String
        withArgs(a: Int!, b: Int): Int
        withArgs2(a: Int): Int!
      }
      union HumanType = Human | OtherHuman
    `,
    resolvers: {},
  });
  beforeAll(async () => {
    await isReady;
  });
  test('generate works', async () => {
    const { schemaCode, generatedSchema, scalarsEnumsHash } = await generate(
      server.graphql.schema
    );

    expect(schemaCode).toMatchInlineSnapshot(`
      "/**
       * GQLESS AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
       */

      import { SchemaUnionsKey } from '@mozartspa/gqless';

      export type Maybe<T> = T | null;
      export type Exact<T extends { [key: string]: unknown }> = {
        [K in keyof T]: T[K];
      };
      export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
        { [SubKey in K]?: Maybe<T[SubKey]> };
      export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
        { [SubKey in K]: Maybe<T[SubKey]> };
      /** All built-in and custom scalars, mapped to their actual values */
      export interface Scalars {
        ID: string;
        String: string;
        Boolean: boolean;
        Int: number;
        Float: number;
        ExampleScalar: any;
      }

      /** Greetings Enum */
      export enum GreetingsEnum {
        /** Hello */
        Hello = 'Hello',
        /** Hi */
        Hi = 'Hi',
        /** Hey */
        Hey = 'Hey',
        Bye = 'Bye',
      }

      export enum OtherEnum {
        Other = 'Other',
      }

      /** Greetings Input */
      export interface GreetingsInput {
        /** Language */
        language: Scalars['String'];
        value?: Maybe<Scalars['String']>;
        scal?: Maybe<Scalars['ExampleScalar']>;
      }

      export const scalarsEnumsHash: import('@mozartspa/gqless').ScalarsEnumsHash = {
        ExampleScalar: true,
        GreetingsEnum: true,
        OtherEnum: true,
        String: true,
        Int: true,
        Boolean: true,
      };
      export const generatedSchema = {
        query: {
          __typename: { __type: 'String!' },
          simpleString: { __type: 'String!' },
          stringWithArgs: { __type: 'String!', __args: { hello: 'String!' } },
          stringNullableWithArgs: {
            __type: 'String',
            __args: { hello: 'String!', helloTwo: 'String' },
          },
          stringNullableWithArgsArray: {
            __type: 'String',
            __args: { hello: '[String]!' },
          },
          object: { __type: 'Human' },
          objectArray: { __type: '[Human]' },
          objectWithArgs: { __type: 'Human!', __args: { who: 'String!' } },
          arrayString: { __type: '[String!]!' },
          arrayObjectArgs: { __type: '[Human!]!', __args: { limit: 'Int' } },
          greetings: { __type: 'GreetingsEnum!' },
          giveGreetingsInput: {
            __type: 'String!',
            __args: { input: 'GreetingsInput!' },
          },
          enumsInput: {
            __type: 'GreetingsEnum',
            __args: {
              nullableEnum: 'GreetingsEnum',
              notNullableEnum: 'GreetingsEnum!',
            },
          },
          number: { __type: 'Int!' },
        },
        mutation: {
          __typename: { __type: 'String!' },
          increment: { __type: 'Int!', __args: { n: 'Int!' } },
        },
        subscription: {},
        GreetingsInput: {
          language: { __type: 'String!' },
          value: { __type: 'String' },
          scal: { __type: 'ExampleScalar' },
        },
        NamedEntity: {
          __typename: { __type: 'String!' },
          name: { __type: 'String!' },
          other: { __type: 'String' },
          withArgs: { __type: 'Int', __args: { a: 'Int!', b: 'Int' } },
          withArgs2: { __type: 'Int!', __args: { a: 'Int' } },
        },
        Human: {
          __typename: { __type: 'String!' },
          name: { __type: 'String!' },
          other: { __type: 'String' },
          father: { __type: 'Human!' },
          fieldWithArgs: { __type: 'Int!', __args: { id: 'Int!' } },
          withArgs: { __type: 'Int', __args: { a: 'Int!', b: 'Int' } },
          withArgs2: { __type: 'Int!', __args: { a: 'Int' } },
        },
        OtherHuman: {
          __typename: { __type: 'String!' },
          name: { __type: 'String!' },
          other: { __type: 'String' },
          withArgs: { __type: 'Int', __args: { a: 'Int!', b: 'Int' } },
          withArgs2: { __type: 'Int!', __args: { a: 'Int' } },
        },
        [SchemaUnionsKey]: { HumanType: ['Human', 'OtherHuman'] },
      } as const;

      export interface Query {
        __typename: 'Query' | undefined;
        simpleString: ScalarsEnums['String'];
        stringWithArgs: (args: {
          hello: Scalars['String'];
        }) => ScalarsEnums['String'];
        stringNullableWithArgs: (args: {
          hello: Scalars['String']
          /**
           * @defaultValue \`\\"Hi\\"\`
           */;
          helloTwo?: Maybe<Scalars['String']>;
        }) => Maybe<ScalarsEnums['String']>;
        stringNullableWithArgsArray: (args: {
          hello: Array<Maybe<Scalars['String']>>;
        }) => Maybe<ScalarsEnums['String']>;
        object?: Maybe<Human>;
        objectArray?: Maybe<Array<Maybe<Human>>>;
        objectWithArgs: (args: {
          /**
           * Who?
           */
          who: Scalars['String'];
        }) => Human;
        arrayString: Array<ScalarsEnums['String']>;
        arrayObjectArgs: (args?: {
          /**
           * @defaultValue \`10\`
           */
          limit?: Maybe<Scalars['Int']>;
        }) => Array<Human>;
        greetings: ScalarsEnums['GreetingsEnum'];
        giveGreetingsInput: (args: {
          input: GreetingsInput;
        }) => ScalarsEnums['String'];
        enumsInput: (args: {
          nullableEnum?: Maybe<GreetingsEnum>;
          notNullableEnum: GreetingsEnum;
        }) => Maybe<ScalarsEnums['GreetingsEnum']>;
        number: ScalarsEnums['Int'];
      }

      export interface Mutation {
        __typename: 'Mutation' | undefined;
        increment: (args: { n: Scalars['Int'] }) => ScalarsEnums['Int'];
      }

      export interface Subscription {
        __typename: 'Subscription' | undefined;
      }

      /**
       * Named Entity
       */
      export interface NamedEntity {
        __typename: 'NamedEntity' | undefined;
        /**
         * Named Entity Name
         */
        name: ScalarsEnums['String'];
        other?: Maybe<ScalarsEnums['String']>;
        withArgs: (args: {
          /**
           * A Arg
           */
          a: Scalars['Int']
          /**
           * @defaultValue \`0\`
           */;
          b?: Maybe<Scalars['Int']>;
        }) => Maybe<ScalarsEnums['Int']>;
        /**
         * @deprecated No longer supported
         */
        withArgs2: (args?: { a?: Maybe<Scalars['Int']> }) => ScalarsEnums['Int'];
      }

      export interface Human extends Omit<NamedEntity, '__typename'> {
        __typename: 'Human' | undefined;
        name: ScalarsEnums['String'];
        other?: Maybe<ScalarsEnums['String']>;
        father: Human;
        fieldWithArgs: (args: { id: Scalars['Int'] }) => ScalarsEnums['Int'];
        withArgs: (args: {
          a: Scalars['Int'];
          b?: Maybe<Scalars['Int']>;
        }) => Maybe<ScalarsEnums['Int']>;
        withArgs2: (args?: { a?: Maybe<Scalars['Int']> }) => ScalarsEnums['Int'];
      }

      export interface OtherHuman {
        __typename: 'OtherHuman' | undefined;
        name: ScalarsEnums['String'];
        other?: Maybe<ScalarsEnums['String']>;
        withArgs: (args: {
          a: Scalars['Int'];
          b?: Maybe<Scalars['Int']>;
        }) => Maybe<ScalarsEnums['Int']>;
        withArgs2: (args?: { a?: Maybe<Scalars['Int']> }) => ScalarsEnums['Int'];
      }

      export interface SchemaObjectTypes {
        Query: Query;
        Mutation: Mutation;
        Subscription: Subscription;
        NamedEntity: NamedEntity;
        Human: Human;
        OtherHuman: OtherHuman;
      }
      export type SchemaObjectTypesNames =
        | 'Query'
        | 'Mutation'
        | 'Subscription'
        | 'NamedEntity'
        | 'Human'
        | 'OtherHuman';

      export type HumanType =
        | {
            __typename: 'Human' | undefined;
            father: Human;
            fieldWithArgs: (args: { id: Scalars['Int'] }) => ScalarsEnums['Int'];
            name: ScalarsEnums['String'];
            other?: Maybe<ScalarsEnums['String']>;
            withArgs: (args: {
              a: Scalars['Int'];
              b?: Maybe<Scalars['Int']>;
            }) => Maybe<ScalarsEnums['Int']>;
            withArgs2: (args?: { a?: Maybe<Scalars['Int']> }) => ScalarsEnums['Int'];
          }
        | {
            __typename: 'OtherHuman' | undefined;
            father?: undefined;
            fieldWithArgs?: undefined;
            name: ScalarsEnums['String'];
            other?: Maybe<ScalarsEnums['String']>;
            withArgs: (args: {
              a: Scalars['Int'];
              b?: Maybe<Scalars['Int']>;
            }) => Maybe<ScalarsEnums['Int']>;
            withArgs2: (args?: { a?: Maybe<Scalars['Int']> }) => ScalarsEnums['Int'];
          };

      /**
       * Named Entity
       */
      export interface NamedEntity {
        /**
         * Named Entity Name
         */
        name: ScalarsEnums['String'];
        other?: Maybe<ScalarsEnums['String']>;
      }

      export interface GeneratedSchema {
        query: Query;
        mutation: Mutation;
        subscription: Subscription;
      }

      export type MakeNullable<T> = {
        [K in keyof T]: T[K] | undefined;
      };

      export interface ScalarsEnums extends MakeNullable<Scalars> {
        GreetingsEnum: GreetingsEnum | undefined;
        OtherEnum: OtherEnum | undefined;
      }
      "
    `);
    expect(JSON.stringify(generatedSchema)).toMatchInlineSnapshot(
      `"{\\"query\\":{\\"__typename\\":{\\"__type\\":\\"String!\\"},\\"simpleString\\":{\\"__type\\":\\"String!\\"},\\"stringWithArgs\\":{\\"__type\\":\\"String!\\",\\"__args\\":{\\"hello\\":\\"String!\\"}},\\"stringNullableWithArgs\\":{\\"__type\\":\\"String\\",\\"__args\\":{\\"hello\\":\\"String!\\",\\"helloTwo\\":\\"String\\"}},\\"stringNullableWithArgsArray\\":{\\"__type\\":\\"String\\",\\"__args\\":{\\"hello\\":\\"[String]!\\"}},\\"object\\":{\\"__type\\":\\"Human\\"},\\"objectArray\\":{\\"__type\\":\\"[Human]\\"},\\"objectWithArgs\\":{\\"__type\\":\\"Human!\\",\\"__args\\":{\\"who\\":\\"String!\\"}},\\"arrayString\\":{\\"__type\\":\\"[String!]!\\"},\\"arrayObjectArgs\\":{\\"__type\\":\\"[Human!]!\\",\\"__args\\":{\\"limit\\":\\"Int\\"}},\\"greetings\\":{\\"__type\\":\\"GreetingsEnum!\\"},\\"giveGreetingsInput\\":{\\"__type\\":\\"String!\\",\\"__args\\":{\\"input\\":\\"GreetingsInput!\\"}},\\"enumsInput\\":{\\"__type\\":\\"GreetingsEnum\\",\\"__args\\":{\\"nullableEnum\\":\\"GreetingsEnum\\",\\"notNullableEnum\\":\\"GreetingsEnum!\\"}},\\"number\\":{\\"__type\\":\\"Int!\\"}},\\"mutation\\":{\\"__typename\\":{\\"__type\\":\\"String!\\"},\\"increment\\":{\\"__type\\":\\"Int!\\",\\"__args\\":{\\"n\\":\\"Int!\\"}}},\\"subscription\\":{},\\"GreetingsInput\\":{\\"language\\":{\\"__type\\":\\"String!\\"},\\"value\\":{\\"__type\\":\\"String\\"},\\"scal\\":{\\"__type\\":\\"ExampleScalar\\"}},\\"NamedEntity\\":{\\"__typename\\":{\\"__type\\":\\"String!\\"},\\"name\\":{\\"__type\\":\\"String!\\"},\\"other\\":{\\"__type\\":\\"String\\"},\\"withArgs\\":{\\"__type\\":\\"Int\\",\\"__args\\":{\\"a\\":\\"Int!\\",\\"b\\":\\"Int\\"}},\\"withArgs2\\":{\\"__type\\":\\"Int!\\",\\"__args\\":{\\"a\\":\\"Int\\"}}},\\"Human\\":{\\"__typename\\":{\\"__type\\":\\"String!\\"},\\"name\\":{\\"__type\\":\\"String!\\"},\\"other\\":{\\"__type\\":\\"String\\"},\\"father\\":{\\"__type\\":\\"Human!\\"},\\"fieldWithArgs\\":{\\"__type\\":\\"Int!\\",\\"__args\\":{\\"id\\":\\"Int!\\"}},\\"withArgs\\":{\\"__type\\":\\"Int\\",\\"__args\\":{\\"a\\":\\"Int!\\",\\"b\\":\\"Int\\"}},\\"withArgs2\\":{\\"__type\\":\\"Int!\\",\\"__args\\":{\\"a\\":\\"Int\\"}}},\\"OtherHuman\\":{\\"__typename\\":{\\"__type\\":\\"String!\\"},\\"name\\":{\\"__type\\":\\"String!\\"},\\"other\\":{\\"__type\\":\\"String\\"},\\"withArgs\\":{\\"__type\\":\\"Int\\",\\"__args\\":{\\"a\\":\\"Int!\\",\\"b\\":\\"Int\\"}},\\"withArgs2\\":{\\"__type\\":\\"Int!\\",\\"__args\\":{\\"a\\":\\"Int\\"}}}}"`
    );
    expect(JSON.stringify(scalarsEnumsHash)).toMatchInlineSnapshot(
      `"{\\"ExampleScalar\\":true,\\"GreetingsEnum\\":true,\\"OtherEnum\\":true,\\"String\\":true,\\"Int\\":true,\\"Boolean\\":true}"`
    );
  });
});

test('prettier detects invalid code', async () => {
  const { server, isReady } = createTestApp({
    schema: gql`
      type Query {
        hello: String!
      }
    `,
  });
  await isReady;

  await expect(
    generate(server.graphql.schema, {
      preImport: `
        con a; // invalid code
        `,
    })
  ).rejects.toThrow("';' expected. (6:13)");
});

describe('mutation', () => {
  const { server, isReady } = createTestApp({
    schema: gql`
      type Query {
        hello: String!
      }
      type Mutation {
        helloMutation(hello: String!): String!
      }
    `,
    resolvers: {
      Mutation: {
        helloMutation(_root, { hello }: { hello: string }) {
          return hello;
        },
      },
    },
  });

  beforeAll(async () => {
    await isReady;
  });

  test('generates mutation', async () => {
    const { schemaCode, generatedSchema, scalarsEnumsHash } = await generate(
      server.graphql.schema
    );

    expect(schemaCode).toMatchInlineSnapshot(`
      "/**
       * GQLESS AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
       */

      export type Maybe<T> = T | null;
      export type Exact<T extends { [key: string]: unknown }> = {
        [K in keyof T]: T[K];
      };
      export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
        { [SubKey in K]?: Maybe<T[SubKey]> };
      export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
        { [SubKey in K]: Maybe<T[SubKey]> };
      /** All built-in and custom scalars, mapped to their actual values */
      export interface Scalars {
        ID: string;
        String: string;
        Boolean: boolean;
        Int: number;
        Float: number;
      }

      export const scalarsEnumsHash: import('@mozartspa/gqless').ScalarsEnumsHash = {
        String: true,
        Boolean: true,
      };
      export const generatedSchema = {
        query: { __typename: { __type: 'String!' }, hello: { __type: 'String!' } },
        mutation: {
          __typename: { __type: 'String!' },
          helloMutation: { __type: 'String!', __args: { hello: 'String!' } },
        },
        subscription: {},
      } as const;

      export interface Query {
        __typename: 'Query' | undefined;
        hello: ScalarsEnums['String'];
      }

      export interface Mutation {
        __typename: 'Mutation' | undefined;
        helloMutation: (args: { hello: Scalars['String'] }) => ScalarsEnums['String'];
      }

      export interface Subscription {
        __typename: 'Subscription' | undefined;
      }

      export interface SchemaObjectTypes {
        Query: Query;
        Mutation: Mutation;
        Subscription: Subscription;
      }
      export type SchemaObjectTypesNames = 'Query' | 'Mutation' | 'Subscription';

      export interface GeneratedSchema {
        query: Query;
        mutation: Mutation;
        subscription: Subscription;
      }

      export type MakeNullable<T> = {
        [K in keyof T]: T[K] | undefined;
      };

      export interface ScalarsEnums extends MakeNullable<Scalars> {}
      "
    `);
    expect(generatedSchema).toMatchInlineSnapshot(`
      Object {
        "mutation": Object {
          "__typename": Object {
            "__type": "String!",
          },
          "helloMutation": Object {
            "__args": Object {
              "hello": "String!",
            },
            "__type": "String!",
          },
        },
        "query": Object {
          "__typename": Object {
            "__type": "String!",
          },
          "hello": Object {
            "__type": "String!",
          },
        },
        "subscription": Object {},
      }
    `);
    expect(scalarsEnumsHash).toMatchInlineSnapshot(`
      Object {
        "Boolean": true,
        "String": true,
      }
    `);
  });
});

describe('subscription', () => {
  const { server, isReady } = createTestApp({
    schema: gql`
      type Query {
        hello: String!
      }
      type Subscription {
        newNotification: String!
      }
    `,
    resolvers: {
      Query: {
        hello() {
          return 'hello world';
        },
      },
    },
  });

  beforeAll(async () => {
    await isReady;
  });

  test('generates subscription', async () => {
    const { schemaCode, generatedSchema, scalarsEnumsHash } = await generate(
      server.graphql.schema
    );

    expect(schemaCode).toMatchInlineSnapshot(`
      "/**
       * GQLESS AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
       */

      export type Maybe<T> = T | null;
      export type Exact<T extends { [key: string]: unknown }> = {
        [K in keyof T]: T[K];
      };
      export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
        { [SubKey in K]?: Maybe<T[SubKey]> };
      export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
        { [SubKey in K]: Maybe<T[SubKey]> };
      /** All built-in and custom scalars, mapped to their actual values */
      export interface Scalars {
        ID: string;
        String: string;
        Boolean: boolean;
        Int: number;
        Float: number;
      }

      export const scalarsEnumsHash: import('@mozartspa/gqless').ScalarsEnumsHash = {
        String: true,
        Boolean: true,
      };
      export const generatedSchema = {
        query: { __typename: { __type: 'String!' }, hello: { __type: 'String!' } },
        mutation: {},
        subscription: {
          __typename: { __type: 'String!' },
          newNotification: { __type: 'String!' },
        },
      } as const;

      export interface Query {
        __typename: 'Query' | undefined;
        hello: ScalarsEnums['String'];
      }

      export interface Mutation {
        __typename: 'Mutation' | undefined;
      }

      export interface Subscription {
        __typename: 'Subscription' | undefined;
        newNotification: ScalarsEnums['String'];
      }

      export interface SchemaObjectTypes {
        Query: Query;
        Mutation: Mutation;
        Subscription: Subscription;
      }
      export type SchemaObjectTypesNames = 'Query' | 'Mutation' | 'Subscription';

      export interface GeneratedSchema {
        query: Query;
        mutation: Mutation;
        subscription: Subscription;
      }

      export type MakeNullable<T> = {
        [K in keyof T]: T[K] | undefined;
      };

      export interface ScalarsEnums extends MakeNullable<Scalars> {}
      "
    `);
    expect(generatedSchema).toMatchInlineSnapshot(`
      Object {
        "mutation": Object {},
        "query": Object {
          "__typename": Object {
            "__type": "String!",
          },
          "hello": Object {
            "__type": "String!",
          },
        },
        "subscription": Object {
          "__typename": Object {
            "__type": "String!",
          },
          "newNotification": Object {
            "__type": "String!",
          },
        },
      }
    `);
    expect(scalarsEnumsHash).toMatchInlineSnapshot(`
      Object {
        "Boolean": true,
        "String": true,
      }
    `);
  });
});

test('javascript output works', async () => {
  const { server, isReady } = createTestApp({
    schema: gql`
      type A {
        a: String
      }
      type B {
        b: Int
      }
      union C = A | B
      type Query {
        hello: String!
      }
      type Subscription {
        newNotification: String!
      }
    `,
    resolvers: {
      Query: {
        hello() {
          return 'hello world';
        },
      },
    },
  });

  await isReady;

  const {
    isJavascriptOutput,
    clientCode,
    javascriptSchemaCode,
    generatedSchema,
    schemaCode,
  } = await generate(server.graphql.schema, {
    react: true,
    subscriptions: true,
    javascriptOutput: true,
  });

  expect(isJavascriptOutput).toBe(true);

  expect(clientCode).toMatchInlineSnapshot(`
    "/**
     * GQLESS: You can safely modify this file and Query Fetcher based on your needs
     */

    import { createReactClient } from '@mozartspa/gqless-react';
    import { createSubscriptionsClient } from '@mozartspa/gqless-subscriptions';
    import { createClient } from '@mozartspa/gqless';
    import { generatedSchema, scalarsEnumsHash } from './schema.generated';

    /**
     * @type {import(\\"@mozartspa/gqless\\").QueryFetcher}
     */
    const queryFetcher = async function (query, variables) {
      // Modify \\"/api/graphql\\" if needed
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
        mode: 'cors',
      });

      const json = await response.json();

      return json;
    };

    const subscriptionsClient =
      typeof window !== 'undefined'
        ? createSubscriptionsClient({
            wsEndpoint: () => {
              // Modify if needed
              const url = new URL('/api/graphql', window.location.href);
              url.protocol = url.protocol.replace('http', 'ws');
              return url.href;
            },
          })
        : undefined;

    /**
     * @type {import(\\"@mozartspa/gqless\\").GQlessClient<import(\\"./schema.generated\\").GeneratedSchema>}
     */
    export const client = createClient({
      schema: generatedSchema,
      scalarsEnumsHash,
      queryFetcher,
      subscriptionsClient,
    });

    export const { query, mutation, mutate, subscription, resolved, refetch } =
      client;

    /**
     * @type {import(\\"@mozartspa/gqless-react\\").ReactClient<import(\\"./schema.generated\\").GeneratedSchema>}
     */
    const reactClient = createReactClient(client, {
      defaults: {
        // Set this flag as \\"true\\" if your usage involves React Suspense
        // Keep in mind that you can overwrite it in a per-hook basis
        suspense: false,

        // Set this flag based on your needs
        staleWhileRevalidate: false,
      },
    });

    export const {
      graphql,
      useQuery,
      usePaginatedQuery,
      useTransactionQuery,
      useLazyQuery,
      useRefetch,
      useMutation,
      useMetaState,
      prepareReactRender,
      useHydrateCache,
      prepareQuery,
    } = reactClient;

    export * from './schema.generated';
    "
  `);
  expect(javascriptSchemaCode).toMatchInlineSnapshot(`
    "/**
     * GQLESS AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
     */
    import { SchemaUnionsKey } from '@mozartspa/gqless';

    /**
     * @type {import(\\"@mozartspa/gqless\\").ScalarsEnumsHash}
     */
    export const scalarsEnumsHash = { String: true, Int: true, Boolean: true };

    export const generatedSchema = {
      query: { __typename: { __type: 'String!' }, hello: { __type: 'String!' } },
      mutation: {},
      subscription: {
        __typename: { __type: 'String!' },
        newNotification: { __type: 'String!' },
      },
      A: { __typename: { __type: 'String!' }, a: { __type: 'String' } },
      B: { __typename: { __type: 'String!' }, b: { __type: 'Int' } },
      [SchemaUnionsKey]: { C: ['A', 'B'] },
    };
    "
  `);
  expect(generatedSchema).toMatchInlineSnapshot(`
    Object {
      "A": Object {
        "__typename": Object {
          "__type": "String!",
        },
        "a": Object {
          "__type": "String",
        },
      },
      "B": Object {
        "__typename": Object {
          "__type": "String!",
        },
        "b": Object {
          "__type": "Int",
        },
      },
      "mutation": Object {},
      "query": Object {
        "__typename": Object {
          "__type": "String!",
        },
        "hello": Object {
          "__type": "String!",
        },
      },
      "subscription": Object {
        "__typename": Object {
          "__type": "String!",
        },
        "newNotification": Object {
          "__type": "String!",
        },
      },
      Symbol(unionsKey): Object {
        "C": Array [
          "A",
          "B",
        ],
      },
    }
  `);
  expect(schemaCode).toMatchInlineSnapshot(`
    "/**
     * GQLESS AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
     */

    import { SchemaUnionsKey } from '@mozartspa/gqless';

    export type Maybe<T> = T | null;
    export type Exact<T extends { [key: string]: unknown }> = {
      [K in keyof T]: T[K];
    };
    export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
      { [SubKey in K]?: Maybe<T[SubKey]> };
    export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
      { [SubKey in K]: Maybe<T[SubKey]> };
    /** All built-in and custom scalars, mapped to their actual values */
    export interface Scalars {
      ID: string;
      String: string;
      Boolean: boolean;
      Int: number;
      Float: number;
    }

    export declare const scalarsEnumsHash: import('@mozartspa/gqless').ScalarsEnumsHash;
    export declare const generatedSchema: {
      query: { __typename: { __type: 'String!' }; hello: { __type: 'String!' } };
      mutation: {};
      subscription: {
        __typename: { __type: 'String!' };
        newNotification: { __type: 'String!' };
      };
      A: { __typename: { __type: 'String!' }; a: { __type: 'String' } };
      B: { __typename: { __type: 'String!' }; b: { __type: 'Int' } };
      [SchemaUnionsKey]: { C: ['A', 'B'] };
    };

    export interface Query {
      __typename: 'Query' | undefined;
      hello: ScalarsEnums['String'];
    }

    export interface Mutation {
      __typename: 'Mutation' | undefined;
    }

    export interface Subscription {
      __typename: 'Subscription' | undefined;
      newNotification: ScalarsEnums['String'];
    }

    export interface A {
      __typename: 'A' | undefined;
      a?: Maybe<ScalarsEnums['String']>;
    }

    export interface B {
      __typename: 'B' | undefined;
      b?: Maybe<ScalarsEnums['Int']>;
    }

    export interface SchemaObjectTypes {
      Query: Query;
      Mutation: Mutation;
      Subscription: Subscription;
      A: A;
      B: B;
    }
    export type SchemaObjectTypesNames =
      | 'Query'
      | 'Mutation'
      | 'Subscription'
      | 'A'
      | 'B';

    export type C =
      | {
          __typename: 'A' | undefined;
          a?: Maybe<ScalarsEnums['String']>;
          b?: undefined;
        }
      | {
          __typename: 'B' | undefined;
          a?: undefined;
          b?: Maybe<ScalarsEnums['Int']>;
        };

    export interface GeneratedSchema {
      query: Query;
      mutation: Mutation;
      subscription: Subscription;
    }

    export type MakeNullable<T> = {
      [K in keyof T]: T[K] | undefined;
    };

    export interface ScalarsEnums extends MakeNullable<Scalars> {}
    "
  `);
});

test('ignoreArgs transform', async () => {
  const { server, isReady } = createTestApp({
    schema: gql`
      type Query {
        asd(optional1: String, optional2: Int): String!
        zxc(optional: String, required: Int!): Int
      }
    `,
  });

  await isReady;

  let isCalled = false;

  const {
    clientCode,
    generatedSchema,
    javascriptSchemaCode,
    schemaCode,
    scalarsEnumsHash,
  } = await generate(
    server.graphql.schema,
    {},
    {
      ignoreArgs(field) {
        isCalled = true;
        expect(field.name).toBe('asd');
        expect(field.type.toString()).toBe('String!');
        return true;
      },
    }
  );

  expect(isCalled).toBe(true);

  expect(clientCode).toMatchInlineSnapshot(`
    "/**
     * GQLESS: You can safely modify this file and Query Fetcher based on your needs
     */

    import { createReactClient } from '@mozartspa/gqless-react';

    import { createClient, QueryFetcher } from '@mozartspa/gqless';
    import {
      generatedSchema,
      scalarsEnumsHash,
      GeneratedSchema,
      SchemaObjectTypes,
      SchemaObjectTypesNames,
    } from './schema.generated';

    const queryFetcher: QueryFetcher = async function (query, variables) {
      // Modify \\"/api/graphql\\" if needed
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
        mode: 'cors',
      });

      const json = await response.json();

      return json;
    };

    export const client = createClient<
      GeneratedSchema,
      SchemaObjectTypesNames,
      SchemaObjectTypes
    >({
      schema: generatedSchema,
      scalarsEnumsHash,
      queryFetcher,
    });

    export const { query, mutation, mutate, subscription, resolved, refetch } =
      client;

    export const {
      graphql,
      useQuery,
      usePaginatedQuery,
      useTransactionQuery,
      useLazyQuery,
      useRefetch,
      useMutation,
      useMetaState,
      prepareReactRender,
      useHydrateCache,
      prepareQuery,
    } = createReactClient<GeneratedSchema>(client, {
      defaults: {
        // Set this flag as \\"true\\" if your usage involves React Suspense
        // Keep in mind that you can overwrite it in a per-hook basis
        suspense: false,

        // Set this flag based on your needs
        staleWhileRevalidate: false,
      },
    });

    export * from './schema.generated';
    "
  `);
  expect(generatedSchema).toMatchInlineSnapshot(`
    Object {
      "mutation": Object {},
      "query": Object {
        "__typename": Object {
          "__type": "String!",
        },
        "asd": Object {
          "__type": "String!",
        },
        "zxc": Object {
          "__args": Object {
            "optional": "String",
            "required": "Int!",
          },
          "__type": "Int",
        },
      },
      "subscription": Object {},
    }
  `);
  expect(javascriptSchemaCode).toMatchInlineSnapshot(`
    "/**
     * GQLESS AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
     */

    /**
     * @type {import(\\"@mozartspa/gqless\\").ScalarsEnumsHash}
     */
    export const scalarsEnumsHash = { String: true, Int: true, Boolean: true };

    export const generatedSchema = {
      query: {
        __typename: { __type: 'String!' },
        asd: { __type: 'String!' },
        zxc: { __type: 'Int', __args: { optional: 'String', required: 'Int!' } },
      },
      mutation: {},
      subscription: {},
    };
    "
  `);
  expect(schemaCode).toMatchInlineSnapshot(`
    "/**
     * GQLESS AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
     */

    export type Maybe<T> = T | null;
    export type Exact<T extends { [key: string]: unknown }> = {
      [K in keyof T]: T[K];
    };
    export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
      { [SubKey in K]?: Maybe<T[SubKey]> };
    export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
      { [SubKey in K]: Maybe<T[SubKey]> };
    /** All built-in and custom scalars, mapped to their actual values */
    export interface Scalars {
      ID: string;
      String: string;
      Boolean: boolean;
      Int: number;
      Float: number;
    }

    export const scalarsEnumsHash: import('@mozartspa/gqless').ScalarsEnumsHash = {
      String: true,
      Int: true,
      Boolean: true,
    };
    export const generatedSchema = {
      query: {
        __typename: { __type: 'String!' },
        asd: { __type: 'String!' },
        zxc: { __type: 'Int', __args: { optional: 'String', required: 'Int!' } },
      },
      mutation: {},
      subscription: {},
    } as const;

    export interface Query {
      __typename: 'Query' | undefined;
      asd: ScalarsEnums['String'];
      zxc: (args: {
        optional?: Maybe<Scalars['String']>;
        required: Scalars['Int'];
      }) => Maybe<ScalarsEnums['Int']>;
    }

    export interface Mutation {
      __typename: 'Mutation' | undefined;
    }

    export interface Subscription {
      __typename: 'Subscription' | undefined;
    }

    export interface SchemaObjectTypes {
      Query: Query;
      Mutation: Mutation;
      Subscription: Subscription;
    }
    export type SchemaObjectTypesNames = 'Query' | 'Mutation' | 'Subscription';

    export interface GeneratedSchema {
      query: Query;
      mutation: Mutation;
      subscription: Subscription;
    }

    export type MakeNullable<T> = {
      [K in keyof T]: T[K] | undefined;
    };

    export interface ScalarsEnums extends MakeNullable<Scalars> {}
    "
  `);
  expect(scalarsEnumsHash).toMatchInlineSnapshot(`
    Object {
      "Boolean": true,
      "Int": true,
      "String": true,
    }
  `);
});
