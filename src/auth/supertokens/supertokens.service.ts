import { Inject, Injectable } from '@nestjs/common';
import supertokens from 'supertokens-node';
import Session from 'supertokens-node/recipe/session';
import { MODULE_OPTIONS_TOKEN } from '../auth.module-definition';

import { AuthModuleConfig } from '../config.interface';

@Injectable()
export class SupertokensService {
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private readonly config: AuthModuleConfig,
  ) {
    supertokens.init({
      appInfo: this.config.appInfo,
      supertokens: {
        connectionURI: this.config.connectionURI,
        apiKey: this.config.apiKey,
      },
      recipeList: [Session.init()],
    });
  }
}
