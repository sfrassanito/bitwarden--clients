import { EventEmitter } from "@angular/core";

import { ApiService } from "../../abstractions/api.service";
import { StateService } from "../../abstractions/state.service";
import { UpdateAvatarRequest } from "../../models/request/update-avatar.request";
import { ProfileResponse } from "../../models/response/profile.response";

export class AvatarUpdateService {
  avatarUpdated$ = new EventEmitter<string | null>();

  constructor(private apiService: ApiService, private stateService: StateService) {}

  async loadColorFromState(): Promise<string | null> {
    let color = await this.stateService.getAvatarColor();
    //If empty, try loading it from the api, maybe the avatar color has yet to be loaded.
    if (color === undefined) {
      await this.apiService.getProfile().then((profile) => {
        this.stateService.setAvatarColor(profile.avatarColor);
        color = profile.avatarColor;
      });
    }
    return color;
  }

  pushUpdate(color: string | null): Promise<ProfileResponse | void> {
    const request = new UpdateAvatarRequest(color);
    return this.apiService.putAvatar(request).then((response) => {
      if (response.avatarColor === color) {
        this.stateService.setAvatarColor(color);
        this.avatarUpdated$.next(color);
      }
    });
  }
}