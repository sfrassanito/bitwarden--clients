import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";

import { ShareComponent as BaseShareComponent } from "@bitwarden/angular/components/share.component";
import { CipherAttachmentApiServiceAbstraction } from "@bitwarden/common/abstractions/cipher/cipher-attachment-api.service.abstraction";
import { CipherService } from "@bitwarden/common/abstractions/cipher/cipher.service.abstraction";
import { CollectionService } from "@bitwarden/common/abstractions/collection.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { OrganizationService } from "@bitwarden/common/abstractions/organization.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";

@Component({
  selector: "app-vault-share",
  templateUrl: "share.component.html",
})
export class ShareComponent extends BaseShareComponent {
  constructor(
    collectionService: CollectionService,
    platformUtilsService: PlatformUtilsService,
    i18nService: I18nService,
    logService: LogService,
    cipherService: CipherService,
    private route: ActivatedRoute,
    private router: Router,
    organizationService: OrganizationService,
    cipherAttachmentService: CipherAttachmentApiServiceAbstraction
  ) {
    super(
      collectionService,
      platformUtilsService,
      i18nService,
      cipherService,
      logService,
      organizationService,
      cipherAttachmentService
    );
  }

  async ngOnInit() {
    this.onSharedCipher.subscribe(() => {
      this.router.navigate(["view-cipher", { cipherId: this.cipherId }]);
    });
    this.route.queryParams.pipe(first()).subscribe(async (params) => {
      this.cipherId = params.cipherId;
      await this.load();
    });
  }

  async submit(): Promise<boolean> {
    const success = await super.submit();
    if (success) {
      this.cancel();
    }
    return success;
  }

  cancel() {
    this.router.navigate(["/view-cipher"], {
      replaceUrl: true,
      queryParams: { cipherId: this.cipher.id },
    });
  }
}
