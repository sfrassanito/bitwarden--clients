import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { concatMap, Subject, takeUntil } from "rxjs";

import { OrganizationApiServiceAbstraction } from "@bitwarden/common/abstractions/organization/organization-api.service.abstraction";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { OrganizationApiKeyType } from "@bitwarden/common/enums/organizationApiKeyType";
import { Organization } from "@bitwarden/common/models/domain/organization";
import { OrganizationSubscriptionResponse } from "@bitwarden/common/models/response/organization-subscription.response";

import { SubscriptionHiddenIcon } from "./subscription-hidden.icon";

@Component({
  selector: "app-org-subscription",
  templateUrl: "organization-subscription.component.html",
})
export class OrganizationSubscriptionComponent implements OnInit, OnDestroy {
  loading = false;
  firstLoaded = false;
  organizationId: string;
  sub: OrganizationSubscriptionResponse;
  selfHosted = false;
  hasBillingSyncToken: boolean;

  userOrg: Organization;

  subscriptionHiddenIcon = SubscriptionHiddenIcon;

  private destroy$ = new Subject<void>();

  constructor(
    platformUtilsService: PlatformUtilsService,
    private route: ActivatedRoute,
    private organizationService: OrganizationService,
    private organizationApiService: OrganizationApiServiceAbstraction
  ) {
    this.selfHosted = platformUtilsService.isSelfHost();
  }

  async ngOnInit() {
    this.route.params
      .pipe(
        concatMap(async (params) => {
          this.organizationId = params.organizationId;
          await this.load();
          this.firstLoaded = true;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async load() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.userOrg = this.organizationService.get(this.organizationId);
    if (this.userOrg.canManageBilling) {
      this.sub = await this.organizationApiService.getSubscription(this.organizationId);
    }
    const apiKeyResponse = await this.organizationApiService.getApiKeyInformation(
      this.organizationId
    );
    this.hasBillingSyncToken = apiKeyResponse.data.some(
      (i) => i.keyType === OrganizationApiKeyType.BillingSync
    );

    this.loading = false;
  }
}
