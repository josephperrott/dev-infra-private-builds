/// <amd-module name="@angular/dev-infra-private/pullapprove/parse-yaml" />
export interface PullApproveGroupConfig {
    conditions?: string[];
    reviewers: {
        users: string[];
        teams?: string[];
    } | {
        teams: string[];
    };
}
export interface PullApproveConfig {
    version: number;
    github_api_version?: string;
    pullapprove_conditions?: {
        condition: string;
        unmet_status: string;
        explanation: string;
    }[];
    groups: {
        [key: string]: PullApproveGroupConfig;
    };
}
export declare function parsePullApproveYaml(rawYaml: string): PullApproveConfig;
