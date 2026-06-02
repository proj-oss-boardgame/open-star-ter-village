import SocialMedia from '../../components/socialMedia';
import Logo from '../../components/logo';
import FooterLinks from './footerLinks';

const Footer = ({
  siteData,
  links = [],
  logos = [],
  supporters = [],
  originalVersionLabel,
  localizedVersionLabel,
}) => {
  const groupedSupporters = supporters.reduce((groups, supporter) => {
    const title = supporter.title || '';

    if (!groups[title]) {
      groups[title] = [];
    }

    groups[title].push(supporter);
    return groups;
  }, {});

  const supporterGroups = Object.entries(groupedSupporters).map(([title, items]) => ({
    title,
    items,
  }));

  const hasSupporterTitles = supporterGroups.some((group) => group.title);

  return (
    <div
      className="site-footer"
      id="footer"
      style={{ background: '#333', color: '#fff', padding: '20px', textAlign: 'center' }}
    >
      <div className="container footer-main">
        <FooterLinks links={links} />
        <span>{siteData.title}</span>
        <SocialMedia />
        {logos.length > 0 && (
          <div className="footer-logo-group">
            {originalVersionLabel && <div className="footer-logo-group-title">{originalVersionLabel}</div>}
            <div className="d-flex justify-content-center logos margin-2-percent">
              {logos.map((logo) => (
                <Logo
                  key={logo.altText}
                  title={logo.title}
                  altText={logo.altText}
                  src={logo.imageUrl}
                  dimension={{
                    width: logo.width || 163,
                    height: logo.height || 45,
                  }}
                  link={logo.linkUrl}
                />
              ))}
            </div>
          </div>
        )}
        {supporters.length > 0 && (
          <div className="footer-logo-group">
            {localizedVersionLabel && <div className="footer-logo-group-title">{localizedVersionLabel}</div>}
            {hasSupporterTitles ? (
              <div className="footer-localized-grid margin-2-percent">
                {supporterGroups.map((group) => (
                  <div className="footer-localized-block" key={group.title || group.items[0].altText}>
                    <span className="footer-block-label">{group.title || '協力'}:</span>
                    <div className="d-flex align-items-center footer-block-logos">
                      {group.items.map((logo) => (
                        <Logo
                          key={logo.altText}
                          altText={logo.altText}
                          src={logo.imageUrl}
                          dimension={{
                            width: logo.width || 163,
                            height: logo.height || 45,
                          }}
                          link={logo.linkUrl}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="d-flex justify-content-center logos margin-2-percent">
                {supporters.map((logo) => (
                  <Logo
                    key={logo.altText}
                    altText={logo.altText}
                    src={logo.imageUrl}
                    dimension={{
                      width: logo.width || 163,
                      height: logo.height || 45,
                    }}
                    link={logo.linkUrl}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Footer;
