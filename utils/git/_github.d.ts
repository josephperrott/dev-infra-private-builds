/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/utils/git/_github" />
import * as Octokit from '@octokit/rest';
import { RequestParameters } from '@octokit/types';
import { query } from 'typed-graphqlify';
/** Error for failed Github API requests. */
export declare class GithubApiRequestError extends Error {
    status: number;
    constructor(status: number, message: string);
}
/**
 * A Github client for interacting with the Github APIs.
 *
 * Additionally, provides convienience methods for actions which require multiple requests, or
 * would provide value from memoized style responses.
 **/
export declare class _GithubClient extends Octokit {
    /** The Github GraphQL (v4) API. */
    graqhql: GithubGraphqlClient;
    /** The current user based on checking against the Github API. */
    private _currentUser;
    constructor(token?: string);
    /** Retrieve the login of the current user from Github. */
    getCurrentUser(): Promise<string>;
}
/**
 * An object representation of a GraphQL Query to be used as a response type and to generate
 * a GraphQL query string.
 */
declare type GraphQLQueryObject = Parameters<typeof query>[1];
/**
 * A client for interacting with Github's GraphQL API.
 *
 * This class is intentionally not exported as it should always be access/used via a
 * _GithubClient instance.
 */
declare class GithubGraphqlClient {
    /** The Github GraphQL (v4) API. */
    private graqhql;
    constructor(token?: string);
    /** Perform a query using Github's GraphQL API. */
    query<T extends GraphQLQueryObject>(queryObject: T, params?: RequestParameters): Promise<T>;
}
export {};
