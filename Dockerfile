###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:18 As development

# Create app directory
WORKDIR /youtube/src/app

# Copy application dependency manifests to the container image.
COPY package*.json yarn.lock ./

# Install app dependencies
RUN yarn install

# Bundle app source
COPY . .

CMD [ "yarn", "start:dev" ]
###################
# BUILD FOR PRODUCTION
###################

FROM node:18 As build

WORKDIR /youtube/src/app

# Copy the node_modules directory from the development stage
COPY --from=development /youtube/src/app/node_modules ./node_modules

# Copy only the necessary files for building the production bundle
COPY src/ src/
COPY tsconfig.build.json tsconfig.build.json

# Run the build command which creates the production bundle
RUN yarn run build

# Set NODE_ENV environment variable
ENV NODE_ENV production

# Install only the production dependencies
RUN yarn install --only=production

###################
# PRODUCTION
###################

FROM node:18 As production

# Copy the bundled code from the build stage to the production image
COPY --from=build /youtube/src/app/node_modules ./node_modules
COPY --from=build /youtube/src/app/dist ./dist

# Start the server using the production build
CMD [ "yarn", "start:prod" ]