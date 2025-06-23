const OrganisationRegister = require('../models/OrganisationRegister');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate Static OTP for development
const generateOTP = () => {
    return "1234"; // Static OTP for development
};

exports.sendMobileOTP = async (req, res) => {
    try {
        const { mobileNumber } = req.body;

        if (!mobileNumber) {
            return res.status(400).json({ message: 'Mobile number is required' });
        }

        // Generate static OTP
        const otp = generateOTP();

        // Find if organization exists with this mobile number
        let organisation = await OrganisationRegister.findOne({ mobileNumber });

        if (organisation) {
            // Update existing organization's mobile OTP
            organisation.otp = otp;
            organisation.mobileOtpVerificationStatus = false;
        } else {
            // Create new organization entry with mobile OTP
            organisation = new OrganisationRegister({
                mobileNumber,
                otp: otp,
                mobileOtpVerificationStatus: false
            });
        }

        await organisation.save();

        // For development, sending static OTP in response
        res.status(200).json({
            message: 'Mobile OTP sent successfully',
            status: true,
            otp: "1234" // Static OTP for development
        });

    } catch (error) {
        console.error('Error in sendMobileOTP:', error);
        res.status(500).json({ message: 'Error sending mobile OTP' });
    }
};

exports.sendEmailOTP = async (req, res) => {
    try {
        const { email, mobileNumber } = req.body.data;
        console.log(email, mobileNumber, "email,mobileNumber");
        // return ;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Generate static OTP
        const otp = generateOTP();

        // Find if organization exists with this email in either email or organiserEmail field
        let organisation = await OrganisationRegister.findOne({
            $or: [
                { email: email },
                { organiserEmail: email },
                { mobileNumber: mobileNumber }
            ]
        });

        if (organisation) {
            // Update existing organization's email OTP
            organisation.otp = otp;
            organisation.email = email;
            organisation.emailOtpVerificationStatus = false;
        } else {
            // Create new organization entry with email OTP
            organisation = new OrganisationRegister({
                email: email,
                otp: otp,
                emailOtpVerificationStatus: false
            });
        }

        await organisation.save();

        // For development, sending static OTP in response
        res.status(200).json({
            message: 'Email OTP sent successfully',
            status: true,
            otp: "1234" // Static OTP for development
        });

    } catch (error) {
        console.error('Error in sendEmailOTP:', error);
        res.status(500).json({ message: 'Error sending email OTP' });
    }
};

exports.verifyMobileOTP = async (req, res) => {
    try {
        const { mobileNumber, otp } = req.body;
        console.log(mobileNumber, otp, "kkkk");

        if (!mobileNumber || !otp) {
            return res.status(400).json({ message: 'Mobile number and OTP are required' });
        }

        const organisation = await OrganisationRegister.findOne({ mobileNumber });

        if (!organisation) {
            return res.status(404).json({ message: 'Organization not found' });
        }
        console.log(organisation, otp, "kkkk");

        if (organisation.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        organisation.mobileOtpVerificationStatus = true;
        organisation.otp = undefined; // Clear OTP after successful verification
        await organisation.save();

        res.status(200).json({ message: 'Mobile OTP verified successfully', status: true });

    } catch (error) {
        console.error('Error in verifyMobileOTP:', error);
        res.status(500).json({ message: 'Error verifying mobile OTP' });
    }
};

exports.getOrganisationProfile = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                message: 'Organisation ID is required',
                status: false
            });
        }

        // Find organization by ID
        const organisation = await OrganisationRegister.findById(id)
            .select('-password -otp -forgetPasswordOTP -forgetPasswordOTPExpiry');

        if (!organisation) {
            return res.status(404).json({
                message: 'Organization not found',
                status: false
            });
        }

        res.status(200).json({
            message: 'Profile fetched successfully',
            data: organisation,
            status: true
        });

    } catch (error) {
        console.error('Error in getOrganisationProfile:', error);
        res.status(500).json({
            message: 'Error fetching profile',
            status: false
        });
    }
};


exports.updateOrganisationProfile = async (req, res) => {
    try {
        const { mobileNumber, email } = req.body;
        const updateData = {
            name: req.body.name,
            role: req.body.role,
            organiserName: req.body.organiserName,
            organiserAddress: req.body.organiserAddress,
            organiserMobileNumber: req.body.organiserMobileNumber,
            organiserEmail: req.body.organiserEmail,
            organiserWebsite: req.body.organiserWebsite,
            directorName: req.body.directorName,
            directorMobileNumber: req.body.directorMobileNumber
        };

        if (!mobileNumber && !email) {
            return res.status(400).json({
                message: 'Either mobile number or email is required',
                status: false
            });
        }

        // Find organization by mobile number or email
        let organisation;
        if (mobileNumber) {
            organisation = await OrganisationRegister.findOne({ mobileNumber });
        } else {
            organisation = await OrganisationRegister.findOne({
                $or: [{ email: email }, { organiserEmail: email }]
            });
        }

        if (!organisation) {
            return res.status(404).json({
                message: 'Organization not found',
                status: false
            });
        }

        // Remove undefined fields from updateData
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        // Update organization with provided fields
        Object.assign(organisation, updateData);
        await organisation.save();

        // Remove sensitive fields from response
        const updatedOrganisation = organisation.toObject();
        delete updatedOrganisation.password;
        delete updatedOrganisation.otp;
        delete updatedOrganisation.forgetPasswordOTP;
        delete updatedOrganisation.forgetPasswordOTPExpiry;

        res.status(200).json({
            message: 'Profile updated successfully',
            data: updatedOrganisation,
            status: true
        });

    } catch (error) {
        console.error('Error in updateOrganisationProfile:', error);
        res.status(500).json({
            message: 'Error updating profile',
            status: false
        });
    }
};




exports.verifyEmailOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const organisation = await OrganisationRegister.findOne({
            $or: [
                { email: email },
                { organiserEmail: email }
            ]
        });

        if (!organisation) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        if (organisation.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        organisation.emailOtpVerificationStatus = true;
        organisation.otp = undefined; // Clear OTP after successful verification
        await organisation.save();

        res.status(200).json({ message: 'Email OTP verified successfully', status: true });

    } catch (error) {
        console.error('Error in verifyEmailOTP:', error);
        res.status(500).json({ message: 'Error verifying email OTP' });
    }
};

exports.registerOrganisation = async (req, res) => {
    try {
        const {
            name,
            role,
            mobileNumber,
            organiserName,
            organiserAddress,
            organiserMobileNumber,
            organiserEmail,
            organiserWebsite,
            directorName,
            directorMobileNumber,
            password
        } = req.body;

        const existingOrg = await OrganisationRegister.findOne({ mobileNumber });
       

        if (existingOrg && !existingOrg.emailOtpVerificationStatus && !existingOrg.mobileOtpVerificationStatus) {
            return res.status(400).json({ message: 'Please verify OTP first' });
        }

        if (existingOrg && existingOrg.name) {
            return res.status(400).json({ message: 'Organization already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let savedOrganisation;

        if (existingOrg) {
            Object.assign(existingOrg, {
                name,
                role,
                organiserName,
                organiserAddress,
                organiserMobileNumber,
                organiserEmail,
                organiserWebsite,
                directorName,
                directorMobileNumber,
                password: hashedPassword
            });

            savedOrganisation = await existingOrg.save();
           
        } else {
            const newOrganisation = new OrganisationRegister({
                name,
                role,
                mobileNumber,
                organiserName,
                organiserAddress,
                organiserMobileNumber,
                organiserEmail,
                organiserWebsite,
                directorName,
                directorMobileNumber,
                password: hashedPassword,
                otpVerificationStatus: true
            });

            savedOrganisation = await newOrganisation.save();
           
        }

        // Generate JWT token
        // const token = jwt.sign(
        //     {
        //         id: savedOrganisation._id,

        //     },
        //     JWT_SECRET,
        //     { expiresIn: "7d" }
        // );

        const token = jwt.sign({ _id: savedOrganisation._id }, "helllo" , { expiresIn: "7d" });

        const organisationData = savedOrganisation.toObject();
        console.log(organisationData,"organisationData");
        
        delete organisationData.password;
        delete organisationData.otp;

       if(token){
         return res.status(201).json({
            message: 'Organization registered successfully',
            data: organisationData,
            token,
            status: true
        });

       }
    } catch (error) {
        console.error('Error in registerOrganisation:', error);
        res.status(500).json({ message: 'Error registering organization' });
    }
};


exports.getAllOrganisations = async (req, res) => {
    try {
        const organisations = await OrganisationRegister.find({}).select('-password -otp');
        res.status(200).json({ data: organisations, status: true });
    } catch (error) {
        console.error('Error in getAllOrganisations:', error);
        res.status(500).json({ message: 'Error fetching organizations', status: false });
    }
};

exports.getOrganisationById = async (req, res) => {
    try {
        const organisation = await OrganisationRegister.findById(req.params.id).select('-password -otp');
        if (!organisation) {
            return res.status(404).json({ message: 'Organization not found' });
        }
        res.status(200).json({ data: organisation, status: true });
    } catch (error) {
        console.error('Error in getOrganisationById:', error);
        res.status(500).json({ message: 'Error fetching organization', status: false });
    }
};

exports.loginOrganisation = async (req, res) => {
    try {
        const { mobileNumber, email, password } = req.body;
        console.log(mobileNumber, email, password, "loginOrganisation");

        if ((!mobileNumber && !email) || !password) {
            return res.status(400).json({
                message: 'Either mobile number or email, and password are required',
                status: false
            });
        }

        // Find organization by mobile number or email
        let organisation;
        if (mobileNumber) {
            organisation = await OrganisationRegister.findOne({ mobileNumber });
        } else {
            organisation = await OrganisationRegister.findOne({
                $or: [
                    { email: email },
                    { organiserEmail: email }
                ]
            });
        }


        if (!organisation) {
            return res.status(404).json({
                message: 'Organization not found',
                status: false
            });
        }

        // Check if organization has a password (fully registered)
        if (!organisation.password) {
            return res.status(400).json({
                message: 'Organization registration is incomplete. Please complete registration first.',
                status: false
            });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, organisation.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid password',
                status: false
            });
        }

        // Generate JWT token
 
                const token = jwt.sign({ _id: organisation._id }, "helllo" , { expiresIn: "7d" });


        // Return organization data without password
        const organisationData = organisation.toObject();
        delete organisationData.password;
        delete organisationData.otp;

        res.status(200).json({
            message: 'Login successful',
            data: organisationData,
            token,
            status: true
        });

    } catch (error) {
        console.error('Error in loginOrganisation:', error);
        res.status(500).json({
            message: 'Error during login',
            status: false
        });
    }
};
exports.sendForgetPasswordOTP = async (req, res) => {
    try {
        const { mobileNumber, email } = req.body;

        if (!mobileNumber && !email) {
            return res.status(400).json({
                message: 'Either mobile number or email is required',
                status: false
            });
        }

        // Find organization by mobile number or email
        let organisation;
        if (mobileNumber) {
            organisation = await OrganisationRegister.findOne({ mobileNumber });
        } else {
            organisation = await OrganisationRegister.findOne({
                $or: [
                    { email: email },
                    { organiserEmail: email }
                ]
            });
        }

        if (!organisation) {
            return res.status(404).json({
                message: 'Organization not found',
                status: false
            });
        }

        // Generate static OTP for development
        const otp = generateOTP();

        // Update organization with new OTP
        organisation.forgetPasswordOTP = otp;
        organisation.forgetPasswordOTPExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
        await organisation.save();

        // For development, sending static OTP in response
        res.status(200).json({
            message: 'Forget password OTP sent successfully',
            status: true,
            otp: "1234" // Static OTP for development
        });

    } catch (error) {
        console.error('Error in sendForgetPasswordOTP:', error);
        res.status(500).json({
            message: 'Error sending forget password OTP',
            status: false
        });
    }
};

exports.verifyForgetPasswordOTP = async (req, res) => {
    try {
        const { mobileNumber, email, otp } = req.body;

        if ((!mobileNumber && !email) || !otp) {
            return res.status(400).json({
                message: 'Either mobile number or email, and OTP are required',
                status: false
            });
        }

        // Find organization by mobile number or email
        let organisation;
        if (mobileNumber) {
            organisation = await OrganisationRegister.findOne({ mobileNumber });
        } else {
            organisation = await OrganisationRegister.findOne({
                $or: [
                    { email: email },
                    { organiserEmail: email }
                ]
            });
        }

        if (!organisation) {
            return res.status(404).json({
                message: 'Organization not found',
                status: false
            });
        }

        // Check if OTP exists and is not expired
        if (!organisation.forgetPasswordOTP || !organisation.forgetPasswordOTPExpiry) {
            return res.status(400).json({
                message: 'No OTP requested or OTP expired',
                status: false
            });
        }

        if (new Date() > organisation.forgetPasswordOTPExpiry) {
            return res.status(400).json({
                message: 'OTP has expired',
                status: false
            });
        }

        if (organisation.forgetPasswordOTP !== otp) {
            return res.status(400).json({
                message: 'Invalid OTP',
                status: false
            });
        }

        // Clear OTP after successful verification
        organisation.forgetPasswordOTP = undefined;
        organisation.forgetPasswordOTPExpiry = undefined;
        await organisation.save();

        res.status(200).json({
            message: 'OTP verified successfully',
            status: true
        });

    } catch (error) {
        console.error('Error in verifyForgetPasswordOTP:', error);
        res.status(500).json({
            message: 'Error verifying OTP',
            status: false
        });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { mobileNumber, email, newPassword } = req.body;

        if ((!mobileNumber && !email) || !newPassword) {
            return res.status(400).json({
                message: 'Either mobile number or email, and new password are required',
                status: false
            });
        }

        // Find organization by mobile number or email
        let organisation;
        if (mobileNumber) {
            organisation = await OrganisationRegister.findOne({ mobileNumber });
        } else {
            organisation = await OrganisationRegister.findOne({ organiserEmail: email });
        }

        if (!organisation) {
            return res.status(404).json({
                message: 'Organization not found',
                status: false
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        organisation.password = hashedPassword;
        await organisation.save();

        res.status(200).json({
            message: 'Password reset successfully',
            status: true
        });

    } catch (error) {
        console.error('Error in resetPassword:', error);
        res.status(500).json({
            message: 'Error resetting password',
            status: false
        });
    }
};

