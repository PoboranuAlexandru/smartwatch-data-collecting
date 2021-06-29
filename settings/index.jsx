function mySettings(props) {
  return (
    <Page>
      <Section
        title={<Text bold align="center">Fitbit Account</Text>}>
        <Oauth
          settingsKey="oauth"
          title="Collecting Data"
          label="OAuth"
          status="Login"
          authorizeUrl="https://www.fitbit.com/oauth2/authorize"
          requestTokenUrl="https://api.fitbit.com/oauth2/token"
          clientId="22C64G"
          clientSecret="a8274e72b7578657e588fe50e605f961"
          scope="profile"
        />
      </Section>
    </Page>
  );
}

registerSettingsPage(mySettings);